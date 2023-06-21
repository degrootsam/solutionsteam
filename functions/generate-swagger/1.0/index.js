const generateSwagger = async ({ apiUrl, authProfile, email, password }) => {
  const host = apiUrl.split(".betty.app")[0] + ".betty.app";
  const path = apiUrl.split(".betty.app")[1];

  // Convenient for reuse over the functions
  let query = {};
  let fetchSettings = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "",
  };

  // A full swagger without the Paths and Schemas, which are filled by the datamodels
  let swagger = {
    openapi: "3.0.1",
    info: {
      title: "Betty Blocks Remote model",
      license: {
        name: "Apache 2.0",
        url: "http://www.apache.org/licenses/LICENSE-2.0.html",
      },
      version: "1.0.0",
    },
    servers: [
      {
        url: host,
      },
    ],
    tags: [
      {
        name: "Betty Blocks Data source",
        description: "Betty Blocks Data source",
      },
    ],
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        api_key: {
          type: "apiKey",
          name: "api_key",
          in: "header",
        },
      },
    },
  };

  let pathUrl = "";
  // Per datamodel you generate a Path, which basically a possible API request. BB reads the Schemas used in these paths to determine the remote models
  let defaultPath = {
    get: {
      summary: "Get",
      operationId: "List",
      responses: {
        200: {
          description: "Valid response",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Clients",
                },
              },
            },
          },
        },
      },
      security: [
        {
          api_key: ["write:users", "read:users"],
        },
      ],
    },
  };

  // A schema is the actual definition of a datamodel and its properties in the swagger.
  let defaultSchema = {
    type: "object",
    properties: {},
    xml: {
      name: "",
    },
  };

  // GQL also returns relations (BT, HM and HABTM) which should not be send into the remote model
  const acceptedGqlPropTypes = [
    "String",
    "Int",
    "Date",
    "DateTime",
    "Boolean",
    "ENUM",
  ];

  const authenticateOnDataApi = () => {
    query = {
      operationName: "login",
      variables: {},
      query: `mutation login {\n  login(authProfileUuid: "${authProfile}", username: "${email}", password: "${password}") {\n    jwtToken\n  }\n}\n`,
    };
    fetchSettings.body = JSON.stringify(query);
    const bearerToken = fetch(apiUrl, fetchSettings)
      .then((authRes) => authRes.json())
      .then((authResult) => {
        if (authResult.data.login.jwtToken) {
          const bearerToken = "Bearer " + authResult.data.login.jwtToken;
          console.log("Authentication successfull");
          return bearerToken;
        } else throw "Authentication failed";
      })
      .catch((e) => {
        return "Error: " + e;
      });
    return bearerToken;
  };

  const getGQLIntrospection = (bearerToken) => {
    console.log(bearerToken);
    query = {
      operationName: "IntrospectionQuery",
      variables: {},
      query: `query IntrospectionQuery{\n__schema{\ntypes{\nname\nfields{\nname\n}\nkind\n}\n}\n}\n`,
    };
    fetchSettings.body = JSON.stringify(query);
    const gqlObject = fetch(apiUrl, fetchSettings)
      .then((res) => res.json())
      .then((result) => {
        if (result.data.__schema.types) {
          const types = result.data.__schema.types;
          const lists = types.filter(
            (record) => record.kind === "OBJECT" && record.name.endsWith("List")
          );
          console.log("lists found", lists);
          return { gqlLists: lists, gqlTypes: types };
        } else throw "Introspection fetched, but no LIST schemas were found";
      })
      .catch((e) => {
        return "Error: " + e;
      });
    return gqlObject;
  };

  const gqlObjectsToSwaggerSchema = (gqlObject) => {
    const lists = gqlObject.gqlLists;
    const types = gqlObject.gqlTypes;
    if (!lists || !types) {
      return gqlObject;
    }
    let datamodels = [];
    let properties = {};
    let swaggerKind = "String";
    // All introspection objects with the kind OBJECT -> https://i.gyazo.com/52d7d178a2ebc3bc1650eed4a162bc81.png
    // All datamodels have 2 "OBJECTS" assosiated. One for the model and one for getting a List of that model. There are also other "OBJECT" kinds in the introspection for i.e. UpsertMany; AuthenticationPayload;RooMutationQuery and others
    // So know if an OBJECT is actually a datamodel we want to know if there is a List available for that model. If so, look at the non-list OBJECT to fetch properties and types.
    // So each OBJECT which name ends with List,is a datamodel and should also have a OBJECT for all its props
    lists.forEach((modellist) => {
      properties = {};
      var modelName = modellist.name.slice(0, -4);
      var modelDetails = types.find(
        (model) => model.kind === "OBJECT" && model.name == modelName
      );
      if (modelDetails && modelDetails.fields) {
        modelDetails.fields.forEach((field) => {
          // GQL gives types: String, Int, DateTime, Date, Boolean, LIST, NON_NULL (ofType OBJECT), OBJECT;
          // Swagger accepts types: array, boolean, integer, number, object, string
          if (acceptedGqlPropTypes.includes(field.type.name)) {
            swaggerKind =
              field.type.name === "Int"
                ? "integer"
                : field.type.name === "Boolean"
                ? "boolean"
                : "string";
            properties[field.name] = { type: swaggerKind };
          }
        });
        console.log(properties);
        datamodels.push({
          name: modelName,
          properties: properties,
        });
      }
    });
    console.log(datamodels);
    return datamodels;
  };

  const buildSwagger = (models) => {
    if (!models) {
      return "models: ", models;
    }
    models.forEach((model) => {
      // Add a path in swagger and a schema definition
      defaultPath.get.summary = "Get " + model.name;
      defaultPath.get.operationId = "list" + model.name;
      defaultPath.get.responses[200].content[
        "application/json"
      ].schema.items.$ref = "#/components/schemas/" + model.name;
      pathUrl = "/" + model.name + path; // Bogus url but needs to be unique for swagger to work.

      var waaromMoetDit = JSON.parse(JSON.stringify(defaultPath));
      swagger.paths[pathUrl] = waaromMoetDit;

      defaultSchema.xml.name = model.name;
      defaultSchema.properties = model.properties;
      var waaromMoetDit2 = JSON.parse(JSON.stringify(defaultSchema));
      swagger.components.schemas[model.name] = waaromMoetDit2;
    });
    return swagger;
  };

  const bearerToken = await authenticateOnDataApi();
  fetchSettings.headers.Authorization = bearerToken;
  const gqlIntrospection = await getGQLIntrospection(bearerToken);
  // gqlInt returns a lists and types collection
  const datamodels = gqlObjectsToSwaggerSchema(gqlIntrospection);
  const finalSwagger = buildSwagger(datamodels);

  return { result: JSON.stringify(finalSwagger) };
};

export default generateSwagger;
