const postData = async (pid, pname, description, proPrice) => {
    const res = await fetch("http://localhost:7000/update", {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
            id: pid,
            name: pname,
            desc: description,
            price: proPrice
        })
    })
    const data = await res.json();

    console.log(data)
    let response = document.getElementById('result')
    response.innerText = `${data.message} Redirecting...`
    
    setTimeout(()=> {
        window.location.replace("/products");
    }, 2000)
}

document.getElementById('myform').addEventListener('submit', async (e)=>{
    e.preventDefault();
    
    let postId = Number.parseInt(e.target.pId.value)
    console.log(postId)
    let pname = e.target.name.value
    let price = e.target.price.value
    let description = e.target.description.value

    postData(postId, pname, description, price)
   
})