# 💸 Debt Settlement Optimizer

A web application that helps simplify group expense settlements by reducing the number of money transfers needed between people.

The application takes a list of transactions, calculates how much each person actually owes or should receive, and generates an optimized settlement using a greedy algorithm. Instead of making everyone pay everyone else, it finds a simpler set of transactions that leads to the same final balances.

🌐 **Live Demo:** https://debt-settlement-htgx.onrender.com

📂 **GitHub:** https://github.com/Krish6123/Debt-Settlement-Optimizer

---

# Features

* Add multiple transactions between participants.
* Automatically calculate each person's net balance.
* Reduce unnecessary money transfers.
* Handle circular debts correctly.
* Simple and responsive user interface.
* REST API built with Express.
* Fast settlement calculation using a greedy algorithm.

---

# About the Algorithm

The algorithm works in three simple steps:

1. Calculate the net balance of every participant.
2. Split everyone into creditors and debtors.
3. Keep matching the person who should receive the most money with the person who owes the most money until everyone's balance becomes zero.

This gives the same final result while reducing unnecessary transfers.

### Example

```text
Original Transactions

Alice ----100----> Bob
Bob  -----40-----> Charlie
Charlie --20-----> Alice

↓

Net Balances

Alice    -80
Bob      +60
Charlie  +20

↓

Optimized Settlement

Alice ----60----> Bob
Alice ----20----> Charlie
```

---

# Why I Built This

When a group of people splits expenses, it often creates unnecessary payment chains. For example, if Alice pays Bob, Bob pays Charlie, and Charlie pays someone else, some of those transfers can be avoided.

I built this project to find a simpler way to settle those balances while keeping the final outcome exactly the same.

---

# Tech Stack

### Frontend

* HTML
* JavaScript
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Deployment

* Render

---

# Architecture

```text
Frontend (HTML + JavaScript)
           │
           ▼
     Express REST API
           │
           ▼
  Balance Calculator
           │
           ▼
  Settlement Engine
           │
           ▼
 Optimized Transactions
```

---

# API Flow

```text
User
  │
  ▼
Frontend
  │
  ▼
POST /api/v1/optimize
  │
  ▼
Express Controller
  │
  ▼
Balance Calculator
  │
  ▼
Settlement Engine
  │
  ▼
JSON Response
  │
  ▼
UI Rendering
```

---

# Complexity

| Operation               |         Complexity |
| ----------------------- | -----------------: |
| Net Balance Computation |               O(E) |
| Sorting Participants    |         O(V log V) |
| Settlement Process      |               O(V) |
| **Overall**             | **O(E + V log V)** |

Where:

* **V** = Number of participants
* **E** = Number of original transactions

---

# Things This Project Handles

* Circular debts
* Multiple transactions between the same users
* Duplicate participants
* Participants with zero final balance
* Disconnected groups
* Decimal transaction amounts

---

# Running the Project Locally

## Clone the repository

```bash
git clone https://github.com/Krish6123/Debt-Settlement-Optimizer.git
cd Debt-Settlement-Optimizer
```

## Install dependencies

```bash
npm install
```

## Start the server

```bash
npm start
```

Open your browser and visit:

```text
http://localhost:3000
```

---

# API

## Optimize Settlements

**POST**

```text
/api/v1/optimize
```

### Request

```json
{
  "transactions": [
    {
      "from": "Alice",
      "to": "Bob",
      "amount": 100
    },
    {
      "from": "Bob",
      "to": "Charlie",
      "amount": 40
    }
  ]
}
```

### Response

```json
{
  "settlements": [
    {
      "from": "Alice",
      "to": "Charlie",
      "amount": 60
    }
  ]
}
```

### Possible Error Responses

```json
{
  "error": "Transactions array is required."
}
```

```json
{
  "error": "Amount must be greater than zero."
}
```

```json
{
  "error": "Invalid request payload."
}
```

---

# What I Learned

Building this project helped me learn:

* Designing REST APIs using Express.
* Organizing backend code into separate modules.
* Applying graph-based thinking to solve a real-world problem.
* Using a greedy algorithm to optimize settlements.
* Deploying a full-stack application on Render.

---

# Future Improvements

* User authentication
* Multi-group expense management
* Store settlement history
* Database integration
* Interactive graph visualization
* Export settlements as CSV/PDF
* Real-time collaboration
* Unit and integration tests

---

# License

This project was built as a learning project and for my portfolio.
