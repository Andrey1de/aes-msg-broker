# aes-msg-broker
action is example of one of queue , may be memory,
# GET retrieve data - /store/action/kind[/key][?db=1] 
	- db is demands to sync with DB
	- Otherwise data have been readed from cache
## /store/action/kind[?db=1] for one record
## /store/action/kind/key[?db=1] for one record
## /store/action/kind[?db=1] -  all the records on kind
## /store/action/all[?db=1 all the records in table

# POST - inserts data - /store/action/kind/key , 
	- body={"jdata":{"item": ...string}[,"store_to": date_string]}
# UPDATE - upserts data - /store/action/kind/key , 
	- body={"jdata":{"item": ...string}[,"store_to": date_string]}


# DELETE removes data - /store/action/kind[/key][?admin=admin] 
## /store/action/kind for one record
	- admin=admin allows to delete many recors

## /store/action/kind/key?admin=admin for many records






https://github.com/patarapolw/indented-filter