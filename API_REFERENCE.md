# Faststock API Reference (ละเอียด)

Base URL
- Backend ตรง (docker-compose): http://localhost:4000/api
- ผ่าน nginx: http://localhost:8081/api
- ตอนนี้ไม่บังคับ Bearer token แล้ว
- ทุก request เขียน body เป็น JSON และใส่ `Content-Type: application/json`

การ Login (ยังใช้ได้ แต่ไม่ได้บังคับกับ endpoint อื่น)
- `POST /auth/login`
  - Body: `{ "username": "user", "password": "pass" }`
  - Response: `{ user, token }` (token อายุ 8 ชั่วโมง ถ้าจะใช้)

หมายเหตุเรื่องวันที่
- ส่ง/รับวันที่เป็น `YYYY-MM-DD`
- ระบบ Event จะคำนวณ `day` ให้อัตโนมัติจาก `edate_start` ถึง `edate_end`

สาย Event
- `GET /event` — ดึงทั้งหมด
- `GET /event/:id` — ดึงตาม id
- `POST /event`
  ```json
  {
    "ename": "Concert Day 1",
    "edate_start": "2025-11-30",
    "edate_end": "2025-12-01",
    "desc": "Main stage"
  }
  ```
  - ระบบจะคำนวณ `day` ให้
- `PUT /event/:id` — ส่งครบฟิลด์เหมือน POST
- `PATCH /event/:id` — ส่งบางฟิลด์ได้ แต่ถ้าแก้วันที่ต้องส่ง `edate_start` และ `edate_end` มาคู่กัน
- `DELETE /event/:id`

สาย Bar
- `GET /bars`
- `GET /bars/:id`
- `GET /bars/user/:uid` — ดึงบาร์ตามผู้รับผิดชอบ uid
- `GET /bars/event/:eid` — ดึงบาร์ตามอีเวนต์
- `POST /bars`
  ```json
  { "eid": 1, "uid": 1, "bname": "Bar A", "desc": "Main bar" }
  ```
  - ต้องมี event (`eid`) และ user (`uid`) ที่มีอยู่จริง (FK)
- `PUT /bars/:id` — ส่งครบฟิลด์
- `PATCH /bars/:id` — ส่งบางฟิลด์
- `DELETE /bars/:id`

สาย Product (master data)
- `GET /products`
- `GET /products/:id`
- `POST /products`
  ```json
  {
    "pname": "Singha Beer",
    "vol": 330,
    "category": "beer",
    "unit": "bottle",
    "factor": 1,
    "subunit": "bottle",
    "desc": "Lager 330ml"
  }
  ```
- `PUT /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`

สาย Stock
- ความหมายตาราง `stock`: ต่อบาร์ (`bid`), ต่อสินค้า (`pid`), ต่อวัน (`sdate`)
  - ฟิลด์: `bid`, `sdate`, `pid`, `start_quantity`, `start_subquantity`, `end_quantity`, `end_subquantity`, `desc`
  - PK: `(bid, sdate, pid)`
- `GET /stock` — ทั้งหมด (join bar+event+product → มี `pname`, `unit`, `subunit`, `eid`, `ename`)
- `GET /stock/bybid/:barId` — ตามบาร์ (หรือใช้ `/bars/:barId/stock`)
- `GET /stock/byeid/:eid` — ตามอีเวนต์ (join bar)
- `GET /bars/:barId/stock?date=YYYY-MM-DD` — ตามบาร์ (เลือกกรองวันได้)
- `POST /bars/:barId/add-stock` — ตั้งสต็อกเริ่มต้นของวัน/สินค้า
  ```json
  {
    "pid": 1,
    "sdate": "2025-11-30",
    "start_quantity": 10,
    "start_subquantity": 0,
    "end_quantity": 10,        // ถ้าไม่ส่งจะใช้ start_quantity
    "end_subquantity": 0,      // ถ้าไม่ส่งจะใช้ start_subquantity
    "desc": "initial load"
  }
  ```
  - ถ้า bar+pid+sdate ซ้ำ จะได้ 409
  - ถ้า bar หรือ product ไม่ตรง FK จะได้ 400
- `PATCH /bars/:barId/stock/:pid/:sdate` — แก้สต็อกบันทึกนั้น (อย่างน้อย 1 ฟิลด์)
  - alias: `PATCH /stock/bar/:barId/product/:pid/:sdate` และ `PATCH /update-stock/bar/:barId/product/:pid/:sdate`
  - Body ตัวอย่าง
    ```json
    { "end_quantity": 8, "desc": "after service" }
    ```
  - ฟิลด์ที่อัปเดตได้: `start_quantity`, `start_subquantity`, `end_quantity`, `end_subquantity`, `desc`
  - ถ้าไม่พบรายการจะได้ 404
- `DELETE /bars/:barId/stock/:pid/:sdate` — ลบแถวนั้น

ตัวอย่างเรียกด้วย curl (ไม่ต้องแนบ token)
1) สร้าง Event
```bash
curl -X POST http://localhost:4000/api/event \
  -H "Content-Type: application/json" \
  -d '{"ename":"Concert Day 1","edate_start":"2025-11-30","edate_end":"2025-12-01","desc":"Main"}'
```
2) สร้าง Bar
```bash
curl -X POST http://localhost:4000/api/bars \
  -H "Content-Type: application/json" \
  -d '{"eid":1,"uid":1,"bname":"Bar A","desc":"Main bar"}'
```
3) สร้าง Product
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"pname":"Singha Beer","vol":330,"category":"beer","unit":"bottle","factor":1,"subunit":"bottle","desc":"Lager"}'
```
4) ตั้งสต็อกเริ่มต้น
```bash
curl -X POST http://localhost:4000/api/bars/1/add-stock \
  -H "Content-Type: application/json" \
  -d '{"pid":1,"sdate":"2025-11-30","start_quantity":10,"start_subquantity":0,"desc":"initial"}'
```
5) ดูสต็อกตามบาร์
```bash
curl http://localhost:4000/api/stock/bybid/1
```
6) แก้สต็อกบางส่วน (alias ใหม่)
```bash
curl -X PATCH http://localhost:4000/api/update-stock/bar/1/product/1/2025-11-30 \
  -H "Content-Type: application/json" \
  -d '{"end_quantity":8,"desc":"after service"}'
```
