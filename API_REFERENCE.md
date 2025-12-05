# Faststock API Reference (อัปเดต)

## Base URL
- Backend ตรง (docker-compose): `http://localhost:4000/api`
- ผ่าน nginx: `http://localhost:8081/api`
- ตอนนี้ endpoint เปิดสาธารณะ (ไม่บังคับ Bearer token) แต่ `/auth/login` ยังใช้ได้ถ้าต้องการ token
- ส่ง JSON ทุกครั้ง พร้อม `Content-Type: application/json`

## หมายเหตุเรื่องวันที่
- ใช้รูปแบบ `YYYY-MM-DD` สำหรับ `edate_start`, `edate_end`, `sdate`, `psdate`
- ระบบ Event จะคำนวณ `day` ให้อัตโนมัติจาก `edate_start` ถึง `edate_end`

## Auth (ไม่บังคับ)
- `POST /auth/login`
  - Body: `{ "username": "user", "password": "pass" }`
  - Response: `{ user, token }` (token อายุ ~8 ชั่วโมง ถ้าจะใช้)

## Event
- `GET /event`
- `GET /event/:id`
- `POST /event`
  ```json
  {
    "ename": "Concert Day 1",
    "edate_start": "2025-11-30",
    "edate_end": "2025-12-01",
    "location": "Bangkok Arena",
    "desc": "Main stage"
  }
  ```
  - ระบบคำนวณ `day` ให้
- `PUT /event/:id` (ส่งครบฟิลด์เหมือน POST)
- `PATCH /event/:id` (ถ้าแก้วันที่ ต้องส่ง start/end คู่กัน)
- `DELETE /event/:id`

## Bar
- `GET /bars`
- `GET /bars/:bid` — ใช้ bid (bar id) เพื่อดึงบาร์เดียว
- `GET /bars/byuid/:uid` — บาร์ตามผู้รับผิดชอบ
- `GET /bars/byeid/:eid` — บาร์ตามอีเวนต์
- `POST /bars`
  ```json
  { "bcode": "BAR-A", "eid": 1, "uid": 1, "desc": "Main bar" }
  ```
- `PUT /bars/:bid`
- `PATCH /bars/:bid`
- `DELETE /bars/:bid`

## Product (master)
- `GET /products`
- `GET /products/:id`
- `POST /products`
  ```json
  {
    "pname": "Singha Beer",
    "vol": 330,
    "volunit": "ml",
    "category": "beer",
    "unit": "bottle",
    "factor": 1,
    "subunit": "bottle",
    "desc": "Lager 330ml"
  }
  ```
  - `vol` ส่งได้หรือไม่ส่งก็ได้ (nullable), ใช้ `volunit` ระบุหน่วย
- `PUT /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`

## Stock
- ตาราง stock (PK: `bcode`, `sdate`, `pid`) เก็บรายวันต่อบาร์/สินค้า (endpoint ที่เกี่ยวกับบาร์รับ `bid` แล้ว map เป็น `bcode` ให้)
- GET:
  - `GET /stock` — ทั้งหมด (join bar+event+product → มี `pname`, `vol`, `volunit`, `unit`, `subunit`, `eid`, `ename`)
  - `GET /stock/bybid/:bid` — ตามบาร์ (หรือ `/bars/:bid/stock?date=YYYY-MM-DD` ถ้าจะกรองวัน)
  - `GET /stock/bybcode/:bcode` — legacy ถ้าถือ bcode อยู่แล้ว
  - `GET /stock/byeid/:eid` — ตามอีเวนต์ (join bar)
- POST:
  - `POST /bars/:bid/add-stock` — ตั้งสต็อกเริ่มต้น/วัน
    ```json
    {
      "pid": 1,
      "sdate": "2025-11-30",
      "start_quantity": 10,
      "start_subquantity": 0,
      "end_quantity": 10,       // ไม่ส่งได้ จะใช้ start_quantity
      "end_subquantity": 0,     // ไม่ส่งได้ จะใช้ start_subquantity
      "desc": "initial load"
    }
    ```
    - ถ้า bar+pid+sdate ซ้ำ → 409, FK ผิด → 400
  - `POST /stock/bulk` — upsert หลายรายการในคำขอเดียว (ต้องส่ง `bid` หรือ `bcode` ใน body)
    ```json
    {
      "bid": 1,
      "items": [
        {
          "pid": 1,
          "sdate": "2024-06-15",
          "start_quantity": 100,
          "start_subquantity": 1,
          "end_quantity": 80,
          "end_subquantity": 0
        },
        {
          "pid": 1,
          "sdate": "2024-06-16",
          "start_quantity": 100,
          "start_subquantity": 1,
          "end_quantity": 80,
          "end_subquantity": 0
        }
      ]
    }
    ```
    - ถ้า record เดิมมีอยู่ จะอัปเดต (upsert) ตามค่าที่ส่ง; ถ้าไม่มีจะสร้างใหม่
    - คืน `created` (true/false) ต่อรายการ
- PATCH (อย่างน้อย 1 ฟิลด์จาก `start_quantity`, `start_subquantity`, `end_quantity`, `end_subquantity`, `desc`):
  - `PATCH /bars/:bid/stock/:pid/:sdate`
  - alias: `PATCH /stock/bar/:bid/product/:pid/:sdate`
  - alias: `PATCH /update-stock/bar/:bid/product/:pid/:sdate`
- DELETE:
  - `DELETE /bars/:bid/stock/:pid/:sdate`

## Prestock
- ตาราง prestock (PK: `eid`, `pid`) เก็บยอดสั่งและยอดรับจริงต่อสินค้าในอีเวนต์
- GET:
  - `GET /prestock` — ทั้งหมด (join event+product → มี `ename`, `pname`, `vol`, `volunit`, `unit`, `subunit`)
  - `GET /prestock/byeid/:eid` — ตามอีเวนต์
  - `GET /event/:eid/prestock` — alias
- POST:
  - `POST /prestock`
    ```json
    {
      "eid": 1,
      "pid": 1,
      "order_quantity": 20,
      "order_subquantity": 0,
      "real_quantity": 18,
      "real_subquantity": 0,
      "psdate": "2025-11-29",
      "desc": "preload"
    }
    ```
    - ถ้า eid+pid ซ้ำ → 409, FK ผิด → 400
- PATCH (อย่างน้อย 1 ฟิลด์จาก `order_quantity`, `order_subquantity`, `real_quantity`, `real_subquantity`, `psdate`, `desc`):
  - `PATCH /prestock/:eid/:pid`
- DELETE:
  - `DELETE /prestock/:eid/:pid`

## Event inventory overview
- `GET /event/inventory/:eid` (alias: `/event/:eid/inventory`) — รวมข้อมูล event + prestock ของอีเวนต์นั้น และ stock ของทุกบาร์ในอีเวนต์เดียวกัน
- Response (ตัวอย่างย่อ):
  ```json
{
  "prestock": [
    { "pid": 1, "pname": "Coca Cola", "date": "2024-06-15", "start_qty": 100, "end_qty": 90, "start_subqty": 0, "end_subqty": 0 }
  ],
  "C1": [
    { "bid": 5, "pid": 1, "pname": "Coca Cola", "date": "2024-06-15", "start_qty": 100, "end_qty": 80, "start_subqty": 1, "end_subqty": 0 }
  ],
  "C2": []
}
```

## ตัวอย่าง curl (ไม่ต้องแนบ token)
1) สร้าง Event
```bash
curl -X POST http://localhost:4000/api/event \
  -H "Content-Type: application/json" \
  -d '{"ename":"Concert Day 1","edate_start":"2025-11-30","edate_end":"2025-12-01","location":"Bangkok","desc":"Main"}'
```
2) สร้าง Bar
```bash
curl -X POST http://localhost:4000/api/bars \
  -H "Content-Type: application/json" \
  -d '{"bcode":"BAR-A","eid":1,"uid":1,"desc":"Main bar"}'
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
6) แก้สต็อก (alias ใหม่)
```bash
curl -X PATCH http://localhost:4000/api/update-stock/bar/1/product/1/2025-11-30 \
  -H "Content-Type: application/json" \
  -d '{"end_quantity":8,"desc":"after service"}'
```
