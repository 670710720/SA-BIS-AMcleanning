package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type Employee struct {
	ID   int    `json:"employee_id"`
	Name string `json:"employee_name"`
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

	mux.HandleFunc("GET /api/employees", func(
		w http.ResponseWriter,
		r *http.Request,
	) {
		rows, err := pool.Query(r.Context(),
			`SELECT employee_id, employee_firstname
			 FROM employees
			 ORDER BY employee_id`,
		)
		if err != nil {
			http.Error(w, "อ่านข้อมูลไม่สำเร็จ",
				http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		employees := []Employee{}

		for rows.Next() {
			var e Employee
			if err := rows.Scan(&e.ID, &e.Name); err != nil {
				http.Error(w, "อ่านข้อมูลไม่สำเร็จ",
					http.StatusInternalServerError)
				return
			}
			employees = append(employees, e)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "อ่านข้อมูลไม่สำเร็จ",
				http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(employees)
	})

	handler := http.HandlerFunc(func(
    w http.ResponseWriter,
    r *http.Request,
) {
    w.Header().Set(
        "Access-Control-Allow-Origin",
        "http://localhost:5173",
    )
    w.Header().Set(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS",
    )
    w.Header().Set(
        "Access-Control-Allow-Headers",
        "Content-Type",
    )

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