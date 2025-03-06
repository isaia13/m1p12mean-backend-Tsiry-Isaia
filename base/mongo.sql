db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nom", "age"],
      properties: {
        username: {
          bsonType: "string",
          description: "Doit être une chaîne de caractères"
        },
        password:{
            bsonType:"string",
            description:"mot de passe"
        },
        email:{
            bsonType:"string",
            description:"doit etre un mail varie"
        }
      }
    }
  }
})
