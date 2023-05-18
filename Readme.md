# API: https://us-central1-sum-prove.cloudfunctions.net/api

## Auth

JSON Body

```javascript
{
  "email" : string,
  "password" : string,
}
```

### /signup

```http
POST /api/auth/signup
```

Response: Success message or Error message

### /signin

```http
POST /api/auth/signin
```

Response

```javascript
{
	"email":string,
	"accessToken":string,
	"refreshToken":string
}
```

## Authorization

Authorization required for posts PUT, POST, DELETE methods

```http
POST /api/posts/
PUT /api/posts/:id
DELETE /api/posts/:id

Header:
'Authentication':'Bearer xxxxxxxxxxxxxxxx'
```

## Posts

### GET /

```http
GET /api/posts/
```

Optional query parameters
| Parameter | Type | Description |
| :-------- | :------- | :---------- |
| `limit` | `string` | limit |
| `offset` | `string` | offset |

Response: Posts array

### GET /:id

```http
GET /api/posts/:id
```

Response: Posts element

### GET /:id

```http
GET /api/posts/:id
```

Response: Posts element

### POST /

```http
POST /api/posts/
```

JSON Request Body

```javascript
{
  "content" : string,
}
```

Response: New Posts element

### PUT /:id

```http
PUT /api/posts/:id
```

JSON Request Body

```javascript
{
  "content" : string,
}
```

Response: New Posts element

### DELETE /:id

```http
DELETE /api/posts/:id
```

Response: Deleted Posts element

## Schemas

### User

```javascript
{
  "id" : string,
	"createdAt": date,
	"updatedAt": date,
	"email": string,
	"password": string,
	"posts": Post[]
}
```

### Post

```javascript
{
  "id" : string,
	"createdAt": date,
	"updatedAt": date,
	"content": string,
	"authorId": string,
	"author": User
}
```
