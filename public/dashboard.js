

       const postData = async (pid, pname, description, proPrice, proq, imageFile, filename, e) => {
            const formData = new FormData();
            formData.append('id', pid);
            formData.append('name', pname);
            formData.append('desc', description);
            formData.append('price', proPrice);
            formData.append('quantity', proq);
            formData.append('filename', filename);
            
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await fetch('http://localhost:7000/addProduct', {
                method: 'POST',
                body: formData
            })
        
            const data = await res.json();
            console.log("Added!")
                e.target.id.value = ""
                e.target.name.value = ""
                e.target.price.value = ""
                e.target.quantity.value = ""
                e.target.description.value = ""
                e.target.image.value = ""
                e.target.imgFilename.value = ""
                window.location.reload();
        }

        const logout = async () =>{
            try {
                const res = await fetch('http://localhost:7000/logout', {
                    method: 'POST',
                })
                if (res.ok){
                    window.location.href = '/auth'
                }
            } catch (error) {
                console.log('Error:', error)
            }
        }

        document.getElementById('myform').addEventListener('submit', (e)=>{
            e.preventDefault();
            let pId = e.target.id.value
            let pname = e.target.name.value
            let price = e.target.price.value
            let quantity = e.target.quantity.value
            let description = e.target.description.value
            let imageFile = e.target.image.files[0]
            let filename = e.target.imgFilename.value

            postData(pId, pname, description, price, quantity, imageFile, filename, e)

        })



  let distance = [10, 20, 30, 40 ,50]
  let time = [25, 35, 45, 50, 55]
  let home = 0;
  let shop = 0;
  let views = [0, 0];

  console.log("Time:", time)
    
  const getViews = async ()=> {
    try {
        const res = await fetch('/getViews');
        const data = await res.json()

        if(res.ok){
            home = data.views[0].home
            shop = data.views[0].shop
            console.log(data.views[0])

            views = [home, shop];
            console.log("Home: ", home)
            console.log("shop: ", shop)
            console.log(views)

            return views;
        }

    } catch (error) {
        console.log("Error:", error)
        return [0, 0];
    }
  }

  const initializeChart = async () => {
    const ctx = document.getElementById('myChart');
    
    // Check if canvas element exists
    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }

    

    const viewsData = await getViews();

    
    new Chart(ctx, {
        type: 'bar', 
        data: {
            labels: ["Home", "Shop"],
            datasets: [{
                label: '# of Views Per Page',
                data: viewsData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    let analysis = document.getElementById('analysis')
    if(viewsData[0] < viewsData[1])
    {
        analysis.innerText = "Users Who create accounts Visit the page more often than new ones"
    }
    else{
    analysis.innerText = "More Visitors leave before creating accounts"
    }
}

initializeChart();

        document.getElementById('logout').addEventListener('click', ()=>{
            logout()
        })