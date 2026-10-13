
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type Resource struct {
	Table    string
	ID       string
	Columns  []string
	Required []string
}

var resources = map[string]Resource{
	"departments": {
		Table: "department",
		ID: "department_id",
		Columns: []string{
			"department_id", "department_name",
		},
		Required: []string{"department_name"},
	},
	"employees": {
		Table: "employees",
		ID: "employee_id",
		Columns: []string{
			"employee_id",
			"employee_firstname",
			"employee_lastname",
			"address",
			"phone_number",
			"birth_date",
			"hire_date",
			"bank_account",
			"edu_qualification",
			"department_id",
		},
		Required: []string{
			"employee_id",
			"employee_firstname",
			"employee_lastname",
			"address",
			"phone_number",
			"birth_date",
			"bank_account",
			"edu_qualification",
			"department_id",
		},
	},
	"customers": {
		Table: "customers",
		ID: "customer_id",
		Columns: []string{
			"customer_id",
			"customer_firstname",
			"customer_lastname",
			"address",
			"phone_number",
			"tax_id",
			"start_date",
		},
		Required: []string{
			"customer_id",
			"customer_firstname",
			"customer_lastname",
			"address",
			"phone_number",
			"tax_id",
			"start_date",
		},
	},
	"payroll": {
		Table: "payroll",
		ID: "payroll_id",
		Columns: []string{
			"payroll_id",
			"salary",
			"bonus",
			"employee_id",
		},
		Required: []string{
			"payroll_id",
			"salary",
			"bonus",
			"employee_id",
		},
	},
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func normalizeJSON(v any) any {
	switch x := v.(type) {
	case json.Number:
		if i, err := x.Int64(); err == nil {
			return i
		}
		if f, err := x.Float64(); err == nil {
			return f
		}
		return string(x)
	case map[string]any:
		for k, val := range x {
			x[k] = normalizeJSON(val)
		}
		return x
	case []any:
		for i, val := range x {
			x[i] = normalizeJSON(val)
		}
		return x
	default:
		return v
	}
}

func readBody(r *http.Request) (map[string]any, error) {
	var body map[string]any

	decoder := json.NewDecoder(r.Body)
	decoder.UseNumber()

	if err := decoder.Decode(&body); err != nil {
		return nil, err
	}
	if body == nil {
		return nil, errors.New("ข้อมูลต้องเป็น JSON object")
	}

	normalizeJSON(body)
	return body, nil
}

func allowedColumns(resource Resource) map[string]bool {
	result := make(map[string]bool)
	for _, col := range resource.Columns {
		result[col] = true
	}
	return result
}

func validateBody(
	body map[string]any,
	resource Resource,
	isCreate bool,
) error {
	allowed := allowedColumns(resource)

	for key, value := range body {
		if !allowed[key] {
			return fmt.Errorf("ไม่รู้จักคอลัมน์ %s", key)
		}
		if key == resource.ID && !isCreate {
			return fmt.Errorf("ห้ามแก้ไขรหัสหลัก %s", resource.ID)
		}
		if value == nil {
			return fmt.Errorf("%s ห้ามเป็น null", key)
		}
	}

	if isCreate {
		for _, key := range resource.Required {
			value, exists := body[key]
			if !exists || value == nil || value == "" {
				return fmt.Errorf("กรุณาระบุ %s", key)
			}
		}
	}

	if resource.Table == "department" {
		if value, ok := body["department_name"].(string); ok {
			if strings.TrimSpace(value) == "" {
				return errors.New("กรุณาระบุชื่อแผนก")
			}
			if len([]rune(value)) > 15 {
				return errors.New("ชื่อแผนกต้องไม่เกิน 15 ตัวอักษร")
			}
		}
	}

	return nil
}

func handleDBError(w http.ResponseWriter, err error) {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505":
			writeError(w, http.StatusConflict, "ข้อมูลซ้ำกับข้อมูลที่มีอยู่")
			return
		case "23503":
			writeError(w, http.StatusConflict,
				"ไม่สามารถดำเนินการได้ เนื่องจากมีข้อมูลอื่นอ้างอิงอยู่")
			return
		case "23502":
			writeError(w, http.StatusBadRequest,
				"กรุณากรอกข้อมูลที่จำเป็นให้ครบ")
			return
		case "22P02", "22007", "22008", "22003":
			writeError(w, http.StatusBadRequest,
				"รูปแบบหรือค่าของข้อมูลไม่ถูกต้อง")
			return
		}
	}

	log.Printf("Database error: %v", err)
	writeError(w, http.StatusInternalServerError, "เกิดข้อผิดพลาดในฐานข้อมูล")
}

func getResource(r *http.Request) (Resource, bool) {
	res, ok := resources[r.PathValue("resource")]
	return res, ok
}

func listRecords(
	w http.ResponseWriter,
	r *http.Request,
	pool *pgxpool.Pool,
	res Resource,
) {
	var query string

	if res.Table == "department" {
		query = `
			SELECT d.department_id, d.department_name,
			       COUNT(e.employee_id) AS employee_count
			FROM department d
			LEFT JOIN employees e
			  ON e.department_id = d.department_id
			GROUP BY d.department_id, d.department_name
			ORDER BY d.department_id
		`
	} else {
		cols := strings.Join(res.Columns, ", ")
		query = fmt.Sprintf(
			"SELECT %s FROM %s ORDER BY %s",
			cols, res.Table, res.ID,
		)
	}

	rows, err := pool.Query(r.Context(), query)
	if err != nil {
		handleDBError(w, err)
		return
	}
	defer rows.Close()

	results := []map[string]any{}

	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			handleDBError(w, err)
			return
		}

		fields := rows.FieldDescriptions()
		record := map[string]any{}

		for i, field := range fields {
			record[string(field.Name)] = values[i]
		}

		results = append(results, record)
	}

	if err := rows.Err(); err != nil {
		handleDBError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, results)
}

func createRecord(
	w http.ResponseWriter,
	r *http.Request,
	pool *pgxpool.Pool,
	res Resource,
) {
	body, err := readBody(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "JSON ไม่ถูกต้อง")
		return
	}

	if err := validateBody(body, res, true); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Department ไม่มี DEFAULT ของรหัส:
	// กำหนดรหัสถัดไปให้อัตโนมัติใน transaction
	if res.Table == "department" {
		tx, err := pool.Begin(r.Context())
		if err != nil {
			handleDBError(w, err)
			return
		}
		defer tx.Rollback(r.Context())

		_, err = tx.Exec(r.Context(),
			"LOCK TABLE department IN EXCLUSIVE MODE")
		if err != nil {
			handleDBError(w, err)
			return
		}

		var nextID int
		err = tx.QueryRow(r.Context(),
			"SELECT COALESCE(MAX(department_id), 0) + 1 FROM department",
		).Scan(&nextID)
		if err != nil {
			handleDBError(w, err)
			return
		}

		if nextID < 1 || nextID > 99 {
			writeError(w, http.StatusConflict, "รหัสแผนกเต็มแล้ว")
			return
		}

		body["department_id"] = nextID

		record, err := insertRecord(r.Context(), tx, res, body)
		if err != nil {
			handleDBError(w, err)
			return
		}

		if err := tx.Commit(r.Context()); err != nil {
			handleDBError(w, err)
			return
		}

		writeJSON(w, http.StatusCreated, record)
		return
	}

	record, err := insertRecord(r.Context(), pool, res, body)
	if err != nil {
		handleDBError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, record)
}

type dbExecutor interface {
	QueryRow(
		context.Context,
		string,
		...any,
	) pgx.Row
}

func insertRecord(
	ctx context.Context,
	executor dbExecutor,
	res Resource,
	body map[string]any,
) (map[string]any, error) {
	columns := make([]string, 0, len(body))
	for key := range body {
		columns = append(columns, key)
	}
	sort.Strings(columns)

	placeholders := make([]string, len(columns))
	values := make([]any, len(columns))

	for i, col := range columns {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		values[i] = body[col]
	}

	query := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES (%s) RETURNING %s",
		res.Table,
		strings.Join(columns, ", "),
		strings.Join(placeholders, ", "),
		strings.Join(res.Columns, ", "),
	)

	row := executor.QueryRow(ctx, query, values...)
	result := map[string]any{}

	dest := make([]any, len(res.Columns))
	for i := range dest {
		dest[i] = new(any)
	}

	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	for i, col := range res.Columns {
		result[col] = *(dest[i].(*any))
	}

	return result, nil
}

func updateRecord(
	w http.ResponseWriter,
	r *http.Request,
	pool *pgxpool.Pool,
	res Resource,
) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		writeError(w, http.StatusBadRequest, "รหัสไม่ถูกต้อง")
		return
	}

	body, err := readBody(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "JSON ไม่ถูกต้อง")
		return
	}

	if err := validateBody(body, res, false); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if len(body) == 0 {
		writeError(w, http.StatusBadRequest, "ไม่มีข้อมูลที่ต้องการแก้ไข")
		return
	}

	columns := make([]string, 0, len(body))
	for key := range body {
		columns = append(columns, key)
	}
	sort.Strings(columns)

	sets := make([]string, len(columns))
	values := make([]any, len(columns))

	for i, col := range columns {
		sets[i] = fmt.Sprintf("%s = $%d", col, i+1)
		values[i] = body[col]
	}
	values = append(values, id)

	query := fmt.Sprintf(
		"UPDATE %s SET %s WHERE %s = $%d RETURNING %s",
		res.Table,
		strings.Join(sets, ", "),
		res.ID,
		len(values),
		strings.Join(res.Columns, ", "),
	)

	row := pool.QueryRow(r.Context(), query, values...)
	dest := make([]any, len(res.Columns))
	for i := range dest {
		dest[i] = new(any)
	}

	if err := row.Scan(dest...); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "ไม่พบข้อมูลที่ต้องการแก้ไข")
			return
		}
		handleDBError(w, err)
		return
	}

	result := map[string]any{}
	for i, col := range res.Columns {
		result[col] = *(dest[i].(*any))
	}

	writeJSON(w, http.StatusOK, result)
}

func deleteRecord(
	w http.ResponseWriter,
	r *http.Request,
	pool *pgxpool.Pool,
	res Resource,
) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		writeError(w, http.StatusBadRequest, "รหัสไม่ถูกต้อง")
		return
	}

	query := fmt.Sprintf(
		"DELETE FROM %s WHERE %s = $1",
		res.Table, res.ID,
	)

	tag, err := pool.Exec(r.Context(), query, id)
	if err != nil {
		handleDBError(w, err)
		return
	}

	if tag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "ไม่พบข้อมูลที่ต้องการลบ")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "ลบข้อมูลสำเร็จ",
	})
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("ไม่พบไฟล์ .env จะใช้ Environment Variables แทน")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("กรุณากำหนด DATABASE_URL")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	// รองรับ GET, POST, PUT, DELETE ของทุก resource
	mux.HandleFunc("GET /api/{resource}", func(
		w http.ResponseWriter, r *http.Request,
	) {
		res, ok := getResource(r)
		if !ok {
			writeError(w, http.StatusNotFound, "ไม่พบ API นี้")
			return
		}
		listRecords(w, r, pool, res)
	})

	mux.HandleFunc("POST /api/{resource}", func(
		w http.ResponseWriter, r *http.Request,
	) {
		res, ok := getResource(r)
		if !ok {
			writeError(w, http.StatusNotFound, "ไม่พบ API นี้")
			return
		}
		createRecord(w, r, pool, res)
	})

	mux.HandleFunc("PUT /api/{resource}/{id}", func(
		w http.ResponseWriter, r *http.Request,
	) {
		res, ok := getResource(r)
		if !ok {
			writeError(w, http.StatusNotFound, "ไม่พบ API นี้")
			return
		}
		updateRecord(w, r, pool, res)
	})

	mux.HandleFunc("DELETE /api/{resource}/{id}", func(
		w http.ResponseWriter, r *http.Request,
	) {
		res, ok := getResource(r)
		if !ok {
			writeError(w, http.StatusNotFound, "ไม่พบ API นี้")
			return
		}
		deleteRecord(w, r, pool, res)
	})

	handler := http.HandlerFunc(func(
		w http.ResponseWriter, r *http.Request,
	) {
		origin := r.Header.Get("Origin")
		if origin == "http://localhost:5173" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		mux.ServeHTTP(w, r)
	})

	server := &http.Server{
		Addr:              ":8080",
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Println("Backend running on :8080")
	log.Fatal(server.ListenAndServe())
}
