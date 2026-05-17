from bson import ObjectId

def serialize_mongo(data):
    if isinstance(data, list):
        return [serialize_mongo(item) for item in data]

    if isinstance(data, dict):
        return {
            key: serialize_mongo(value)
            for key, value in data.items()
        }

    if isinstance(data, ObjectId):
        return str(data)

    return data

    