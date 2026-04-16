from pydantic import BaseModel, Field


class ChannelBase(BaseModel):
    name: str = Field(..., description="Channel name")
    server_id: str = Field(..., alias="serverId", description="Channel server ID")


class ChannelCreate(ChannelBase):
    pass


class Channel(ChannelBase):
    id: str = Field(..., alias="_id", description="Unique channel ID")

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "_id": "c1001",
                "name": "general",
                "serverId": "s1001",
            }
        }
