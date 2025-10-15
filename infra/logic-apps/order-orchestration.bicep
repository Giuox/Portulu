@description('Location')
param location string

@description('Logic App name')
param logicAppName string = 'portulu-order-orchestrator'

@description('Event Grid connection details')
param eventGridConnectionName string = 'eventgrid_connection'

resource workflow 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  properties: {
    state: 'Enabled'
    definition: {
      "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {},
      "triggers": {
        "When_a_CloudEvent_is_received": {
          "type": "Request",
          "kind": "Http",
          "inputs": {
            "schema": {
              "type": "object",
              "properties": {
                "type": { "type": "string" },
                "source": { "type": "string" },
                "subject": { "type": "string" },
                "data": { "type": "object" }
              }
            }
          }
        }
      },
      "actions": {
        "Switch_on_type": {
          "type": "Switch",
          "expression": "@triggerBody().type",
          "cases": {
            "orderCreated": {
              "case": "portulu.order.created",
              "actions": {
                "NotifyRestaurant": { "type": "Compose", "inputs": "notify restaurant" }
              }
            },
            "paymentCreated": {
              "case": "portulu.payment.created",
              "actions": {
                "UpdateOrder": { "type": "Compose", "inputs": "update order status" }
              }
            },
            "riderUpdated": {
              "case": "portulu.rider.location.updated",
              "actions": {
                "PushRealtime": { "type": "Compose", "inputs": "push rider location" }
              }
            }
          },
          "default": {
            "type": "Compose",
            "inputs": "ignore"
          }
        }
      },
      "outputs": {}
    }
  }
}

