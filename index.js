const input = document.getElementById("input")
const submitBtn = document.getElementById("submitBtn")
const saveBtn = document.getElementById("saveBtn")
const planing_tasks = document.getElementById("planing_tasks")
const doing_tasks = document.getElementById("doing_tasks")
const did_tasks = document.getElementById("did_tasks")


submitBtn.onclick = async () => { 
    if (input.value === "") 
            return;
        sendTaskToServer(input.value)
        
        const taskList = await loadData()
        
        createOnPlaning(taskList[taskList.length - 1].id, input.value)
        notSavedYet()
        input.value = ""    
}

saveBtn.onclick = () => {
    saveTasks()
    saved()
}

function notSavedYet(){
    saveBtn.style.backgroundColor = "red"
    saveBtn.style.color = "white"
    saveBtn.innerText = "Не сохранено!"
}

function saved(){
    saveBtn.style.backgroundColor = "green"
    saveBtn.style.color = "white"
    saveBtn.innerText = "Сохранено!"
}

function sendTaskToServer(input_text){
    const data = {text: input_text}

    fetch('http://127.0.0.1:8000/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
}

function patchTaskOnServer(id, state){
    const data = {id: id, state: state}

    fetch('http://127.0.0.1:8000/api/tasks', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
}

function deleteTaskOnServer(id){
    const data = {id: id}

    fetch('http://127.0.0.1:8000/api/tasks', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
}

function saveTasks(){
    fetch('http://127.0.0.1:8000/api/save', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: ""
    })
    .then(response => response.json())
}

async function savedTasksStata(){
    let response = await fetch('http://127.0.0.1:8000/api/save', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
        
    })
    let isSaved = await response.json()
    return isSaved
}

function renderTasks(data){

    if (data.state == "planing"){
        createOnPlaning(data.id, data.text)
    }
    if (data.state == "doing"){
        createOnDoing(data.id, data.text)
    }
    if (data.state == "did"){
        createOnDid(data.id, data.text)
    }
}

function moveToPlaning(id){
    const text = document.getElementById(id + "text").innerText
    patchTaskOnServer(id, "planing")
    clearTask(id)
    createOnPlaning(id, text)
    notSavedYet()
}

function moveToDoing(id){
    const text = document.getElementById(id + "text").innerText
    patchTaskOnServer(id, "doing")
    clearTask(id)
    createOnDoing(id, text)
    notSavedYet()
}

function moveToDid(id){
    const text = document.getElementById(id + "text").innerText
    patchTaskOnServer(id, "did")
    clearTask(id)
    createOnDid(id, text)
    notSavedYet()
}

function clearTask(id){
    document.getElementById(id).remove()
}

function deleteTask(id){
    document.getElementById(id).remove()
    deleteTaskOnServer(id)
    notSavedYet()
}

function createOnPlaning(id, text){
    planing_tasks.innerHTML += `
        <li id="${id}">
            <div class="tasks">
                <span id="${id}text">${text}</span>
                <div>
                    <button onclick="moveToDoing('${id}')">→</button>
                    <button onclick="deleteTask('${id}')">X</button>
                </div>
            </div>
        </li>`
}

function createOnDoing(id, text){    
    doing_tasks.innerHTML += `
    <li id="${id}">
        <div class="tasks">
            <span id="${id}text">${text}</span>
            <div>
                <button onclick="moveToPlaning('${id}')">←</button>
                <button onclick="moveToDid('${id}')">→</button>
                <button onclick="deleteTask('${id}')">X</button>
            </div>
        </div>
    </li>`
    
}

function createOnDid(id, text){ 
    did_tasks.innerHTML += `
                <li id="${id}">
                    <div class="tasks">
                        <span id="${id}text">${text}</span>
                        <div>
                            <button onclick="moveToDoing('${id}')">←</button>
                        </div>
                    </div>
                </li>
                `
}

async function loadData(){
    let response = await fetch('http://127.0.0.1:8000/api/tasks', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    let tasks = await response.json()

    return tasks
}

async function init() {
    const taskList = await loadData()

    try{
        for (let i = 0; i<taskList.length; i++){
            renderTasks(taskList[i])
        }
    }
    catch{
        console.log("не удалось отобразить все задачи")
    }

    let isSaved = await savedTasksStata()
    if (!isSaved){
        notSavedYet()
    }
}

init()
