# Json-Server-Lilu

Projet permettant de simuler les appels REST des connecteurs de l'application mobile Lilu de l'université de Lille

## Envrionnement

Node 18.3 et plus

## Dependences

Json-server => permettant de faire le faux service REST

## Execution 

npm start (execute : json-server --watch db.json --port 3000) => Le json-server va creer un service REST à partir du db.json

## Exemple

- GET http://localhost:3000/posts

```
[
  {
    "id": "1",
    "title": "a title",
    "views": 100
  },
  {
    "id": "2",
    "title": "another title",
    "views": 200
  }
]
```


