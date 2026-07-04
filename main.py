from fastapi import FastAPI
import json

#Рассмотреть класс fikeResponse
from fastapi.responses import FileResponse



from pydantic import BaseModel

# забил хуй на это, следует позже ознакомиться с этим
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

data_base = open("db.txt","r", encoding="utf-8")
data_saved = True
idCounter = int(data_base.readline())

tasks = []
try:
    for i in data_base:
        tasks.append(json.loads(i))
except:
    print("База пустая")

data_base.close()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskJSON(BaseModel):
    text: str

class TaskUpdate(BaseModel):
    id: str
    state: str

class TaskDelete(BaseModel):
    id: str

@app.get("/")
def loadHTML():
    return FileResponse("index.html")

@app.get("/index.js")
def loadJS():
    return FileResponse("index.js")

@app.get("/style.css")
def loadCSS():
    return FileResponse("style.css")

@app.post("/api/tasks")
def create_task(task_date: TaskJSON):
    global idCounter, data_saved
    new_task = {
        "id": "task"+str(idCounter),
        "text": task_date.text,
        "state": "planing"
    }
    tasks.append(new_task)
    data_saved = False
    idCounter += 1
    return new_task

@app.get("/api/tasks")
def db():
    return tasks

@app.patch("/api/tasks")
def update(data: TaskUpdate):
    global data_saved
    data_saved = False
    for i in range(len(tasks)):
        if tasks[i].get("id") == data.id:
            tasks[i].update({"state":data.state})
            break

@app.delete("/api/tasks")
def delete(data: TaskDelete):
    global data_saved
    for i in range(len(tasks)):
        if tasks[i].get("id") == data.id:
            tasks.pop(i)
            break
    data_saved = False
    

@app.patch("/api/save")
def save():
    global data_saved
    with open("db.txt","w", encoding="utf-8") as f:
        f.write(str(idCounter) + "\n")
        for i in tasks:
            # json.loads почему-то не любит одинарные ковычки, приходится костылями менять
            f.write(str(i).replace("'", "\"") + "\n") 
    data_saved = True
        
@app.get("/api/save")
def isSave():
    global data_saved
    return data_saved
        
 