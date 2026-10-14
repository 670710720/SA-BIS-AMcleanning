--
-- PostgreSQL database dump
--

\restrict UlsuId74WGyn281r2oe5XqTLzkvjBIU1Y3jN1qmbbaIKfAVIT3CekGysh3Pg07w

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-10-14 13:22:24

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 17239)
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    attendance_date date NOT NULL,
    employee_id numeric(5,0) NOT NULL,
    status character varying(10) NOT NULL,
    reason character varying(20),
    CONSTRAINT attendance_status_check CHECK (((status)::text = ANY ((ARRAY['มาปกติ'::character varying, 'มาสาย'::character varying, 'ลาป่วย'::character varying, 'ลากิจ'::character varying])::text[])))
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17215)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    customer_id numeric(5,0) NOT NULL,
    customer_firstname character varying(30) NOT NULL,
    customer_lastname character varying(30) NOT NULL,
    address character varying(50) NOT NULL,
    phone_number character(10) NOT NULL,
    tax_id character(13) NOT NULL,
    start_date date,
    type_service character varying(10)
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17250)
-- Name: department; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.department (
    department_id numeric(2,0) NOT NULL,
    department_name character varying(15) NOT NULL
);


ALTER TABLE public.department OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17257)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    employee_id numeric(5,0) NOT NULL,
    employee_firstname character varying(30) NOT NULL,
    employee_lastname character varying(30) NOT NULL,
    address character varying(50) NOT NULL,
    phone_number character(10) NOT NULL,
    birth_date date NOT NULL,
    hire_date date,
    bank_account character(10) NOT NULL,
    edu_qualification character varying(20) NOT NULL,
    department_id numeric(2,0) NOT NULL,
    id_number character(13)
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17226)
-- Name: payroll; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll (
    payroll_id numeric(5,0) NOT NULL,
    salary numeric(10,2) CONSTRAINT payroll_base_salary_not_null NOT NULL,
    bonus numeric(10,2),
    employee_id numeric(5,0) NOT NULL
);


ALTER TABLE public.payroll OWNER TO postgres;

--
-- TOC entry 5034 (class 0 OID 17239)
-- Dependencies: 221
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (attendance_date, employee_id, status, reason) FROM stdin;
2026-10-12	10001	มาปกติ	
2026-10-12	10002	มาปกติ	
2026-10-12	10003	มาปกติ	
2026-10-12	10004	มาสาย	รถติด
2026-10-12	10005	มาปกติ	
2026-10-12	10006	ลาป่วย	มีไข้
2026-10-12	10007	มาปกติ	
2026-10-12	10008	มาปกติ	
2026-10-12	10009	มาปกติ	
2026-10-12	10010	ลากิจ	ธุระครอบครัว
2026-10-12	10011	มาปกติ	
2026-10-12	10012	มาปกติ	
2026-10-12	10013	มาสาย	รถติด
2026-10-12	10014	มาปกติ	
2026-10-12	10015	มาปกติ	
2026-10-12	10016	มาปกติ	
2026-10-12	10017	มาปกติ	
\.


--
-- TOC entry 5032 (class 0 OID 17215)
-- Dependencies: 219
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (customer_id, customer_firstname, customer_lastname, address, phone_number, tax_id, start_date, type_service) FROM stdin;
1	บริษัท ระยองอุตสาหกรรม	จำกัด	นิคมอุตสาหกรรมมาบตาพุด อ.เมืองระยอง จ.ระยอง	038611201 	0105567001001	2024-01-15	รายเดือน
2	บริษัท บ้านฉางออโต้พาร์ท	จำกัด	ต.บ้านฉาง อ.บ้านฉาง จ.ระยอง	038602202 	0105567001002	2024-03-01	รายเดือน
3	บริษัท เอเชียแพ็กเกจจิ้ง	จำกัด	ต.มาบข่า อ.นิคมพัฒนา จ.ระยอง	038641203 	0105567001003	2024-05-10	รายวัน
4	การไฟฟ้าส่วนภูมิภาค	สาขาระยอง	อ.เมืองระยอง จ.ระยอง	038611204 	0994000165001	2024-06-01	รายวัน
5	การประปาส่วนภูมิภาค	สาขาบ้านฉาง	อ.บ้านฉาง จ.ระยอง	038602205 	0994000165002	2024-08-15	รายเดือน
6	หมู่บ้านพฤกษาระยอง	นิติบุคคลหมู่บ้านจัดสรร	ต.ทับมา อ.เมืองระยอง จ.ระยอง	038621206 	0105567001006	2025-01-01	รายวัน
7	หมู่บ้านเดอะกรีนการ์เด้น	นิติบุคคลหมู่บ้านจัดสรร	ต.เนินพระ อ.เมืองระยอง จ.ระยอง	038621207 	0105567001007	2025-02-01	รายวัน
8	บริษัท โกลเด้นโฮมพร็อพเพอร์ตี้	จำกัด	ต.ปลวกแดง อ.ปลวกแดง จ.ระยอง	038659208 	0105567001008	2025-04-01	รายเดือน
\.


--
-- TOC entry 5035 (class 0 OID 17250)
-- Dependencies: 222
-- Data for Name: department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.department (department_id, department_name) FROM stdin;
1	HR
2	บัญชี
3	ฝ่ายปฏิบัติการ
\.


--
-- TOC entry 5036 (class 0 OID 17257)
-- Dependencies: 223
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (employee_id, employee_firstname, employee_lastname, address, phone_number, birth_date, hire_date, bank_account, edu_qualification, department_id, id_number) FROM stdin;
10003	สมชาย	ใจดี	อ.บ้านค่าย จ.ระยอง	0812345003	1988-02-18	2021-03-15	1234567892	ปริญญาตรี	3	1648305729147
10001	กมลชนก	ศรีสุข	อ.เมืองระยอง จ.ระยอง	0812345001	1995-04-12	2022-01-10	1234567890	ปริญญาตรี	1	5831047296185
10002	ธนพร	มีทรัพย์	อ.บ้านฉาง จ.ระยอง	0812345002	1993-09-23	2022-02-01	1234567891	ปริญญาตรี	2	7294610835726
10004	สุภาวดี	แสงทอง	อ.เมืองระยอง จ.ระยอง	0812345004	1991-06-05	2021-05-01	1234567893	มัธยมศึกษาตอนปลาย	3	9062718453206
10005	ณัฐพล	บุญช่วย	อ.บ้านฉาง จ.ระยอง	0812345005	1990-11-14	2021-08-01	1234567894	ปวช.	3	3471956284031
10006	พิมพ์ชนก	คำแสน	อ.นิคมพัฒนา จ.ระยอง	0812345006	1996-01-27	2022-04-18	1234567895	มัธยมศึกษาตอนปลาย	3	8156203947182
10007	วิทยา	คงมั่น	อ.ปลวกแดง จ.ระยอง	0812345007	1987-08-09	2022-06-01	1234567896	มัธยมศึกษาตอนปลาย	3	4927381605249
10008	อรทัย	วงศ์ดี	อ.เมืองระยอง จ.ระยอง	0812345008	1994-12-02	2022-09-12	1234567897	ปวช.	3	6710849253168
10009	ประเสริฐ	ทองแท้	อ.บ้านค่าย จ.ระยอง	0812345009	1985-03-30	2023-01-05	1234567898	มัธยมศึกษาตอนปลาย	3	2385697148023
10010	ชลธิชา	บุญมี	อ.บ้านฉาง จ.ระยอง	0812345010	1998-07-19	2023-03-01	1234567899	มัธยมศึกษาตอนปลาย	3	7543021869471
10011	เอกชัย	พูนผล	อ.นิคมพัฒนา จ.ระยอง	0812345011	1989-10-08	2023-05-15	2234567890	ปวช.	3	1094836275018
10012	วราภรณ์	จันทร์ดี	อ.เมืองระยอง จ.ระยอง	0812345012	1992-05-21	2023-07-03	2234567891	มัธยมศึกษาตอนปลาย	3	8261753049627
10013	กิตติพงษ์	สุขใจ	อ.ปลวกแดง จ.ระยอง	0812345013	1991-02-11	2023-10-01	2234567892	มัธยมศึกษาตอนปลาย	3	4159270836415
10014	สุรีย์พร	นาคทอง	อ.บ้านค่าย จ.ระยอง	0812345014	1997-09-16	2024-01-08	2234567893	ปวช.	3	9635182407963
10015	ชัยวัฒน์	อินทร์แก้ว	อ.บ้านฉาง จ.ระยอง	0812345015	1986-04-25	2024-03-11	2234567894	มัธยมศึกษาตอนปลาย	3	5726408193254
10016	มาลี	แก้วประดับ	อ.เมืองระยอง จ.ระยอง	0812345016	1995-12-29	2024-06-01	2234567895	มัธยมศึกษาตอนปลาย	3	3817064928510
10017	ธีรภัทร	แสนดี	อ.นิคมพัฒนา จ.ระยอง	0812345017	1999-03-07	2024-09-16	2234567896	ปวช.	3	6482937150642
\.


--
-- TOC entry 5033 (class 0 OID 17226)
-- Dependencies: 220
-- Data for Name: payroll; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll (payroll_id, salary, bonus, employee_id) FROM stdin;
1	22000.00	1000.00	10001
2	20000.00	800.00	10002
3	16000.00	1000.00	10003
4	14500.00	500.00	10004
5	14500.00	500.00	10005
6	14000.00	500.00	10006
7	15000.00	800.00	10007
8	14000.00	500.00	10008
9	15000.00	800.00	10009
10	14000.00	500.00	10010
11	14500.00	500.00	10011
12	14000.00	500.00	10012
13	14500.00	500.00	10013
14	14000.00	500.00	10014
15	15000.00	800.00	10015
16	14000.00	500.00	10016
17	14000.00	500.00	10017
\.


--
-- TOC entry 4873 (class 2606 OID 17225)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- TOC entry 4879 (class 2606 OID 17256)
-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (department_id);


--
-- TOC entry 4881 (class 2606 OID 17270)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);


--
-- TOC entry 4875 (class 2606 OID 17233)
-- Name: payroll payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_pkey PRIMARY KEY (payroll_id);


--
-- TOC entry 4877 (class 2606 OID 17283)
-- Name: attendance pk_attendance; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT pk_attendance PRIMARY KEY (employee_id, attendance_date);


--
-- TOC entry 4884 (class 2606 OID 17271)
-- Name: employees fk_department_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_department_id FOREIGN KEY (department_id) REFERENCES public.department(department_id);


--
-- TOC entry 4883 (class 2606 OID 17284)
-- Name: attendance fk_employee_id_attendance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_employee_id_attendance FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- TOC entry 4882 (class 2606 OID 17289)
-- Name: payroll fk_employee_id_payroll; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT fk_employee_id_payroll FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


-- Completed on 2026-10-14 13:22:24

--
-- PostgreSQL database dump complete
--

\unrestrict UlsuId74WGyn281r2oe5XqTLzkvjBIU1Y3jN1qmbbaIKfAVIT3CekGysh3Pg07w

