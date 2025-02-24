module.exports = {
  "schemas": {
    "User": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "role": { 
          "type": "string",
          "enum": ["admin", "brand", "influencer"]
        },
        "createdAt": { "type": "string", "format": "date-time" }
      }
    },
    "Influencer": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "socialAccounts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "platform": { "type": "string" },
              "username": { "type": "string" },
              "followers": { "type": "integer" },
              "engagementRate": { "type": "number" }
            }
          }
        },
        "phylloId": { "type": "string" }
      }
    },
    "Campaign": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "budget": { "type": "number" },
        "status": {
          "type": "string",
          "enum": ["draft", "active", "completed"]
        },
        "startDate": { "type": "string", "format": "date" },
        "endDate": { "type": "string", "format": "date" }
      }
    },
    "CampaignAnalytics": {
      "type": "object",
      "properties": {
        "impressions": { "type": "integer" },
        "engagement": { "type": "number" },
        "clicks": { "type": "integer" },
        "conversions": { "type": "integer" }
      }
    },
    "ClientRelationship": {
      "type": "object",
      "properties": {
        "influencerId": { "type": "string" },
        "clientId": { "type": "string" },
        "status": {
          "type": "string",
          "enum": ["active", "past", "potential"]
        }
      }
    },
    "RevenueEntry": {
      "type": "object",
      "properties": {
        "campaignId": { "type": "string" },
        "amount": { "type": "number" },
        "status": {
          "type": "string",
          "enum": ["pending", "paid"]
        }
      }
    },
    "Error": {
      "type": "object",
      "properties": {
        "statusCode": { "type": "integer" },
        "message": { "type": "string" }
      }
    }
  },
  "securitySchemes": {
    "BearerAuth": {
      "type": "http",
      "scheme": "bearer",
      "bearerFormat": "JWT"
    }
  },
  "responses": {
    "BadRequest": {
      "description": "Bad request",
      "content": {
        "application/json": {
          "schema": { "$ref": "#/components/schemas/Error" }
        }
      }
    },
    "Unauthorized": {
      "description": "Unauthorized",
      "content": {
        "application/json": {
          "schema": { "$ref": "#/components/schemas/Error" }
        }
      }
    },
    "NotFound": {
      "description": "Resource not found",
      "content": {
        "application/json": {
          "schema": { "$ref": "#/components/schemas/Error" }
        }
      }
    }
  }
}
;
