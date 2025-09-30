        const postData = async (pid, pname, description, proPrice, imageFile, filename) => {
            const formData = new FormData();
            formData.append('id', pid);
            formData.append('name', pname);
            formData.append('desc', description);
            formData.append('price', proPrice);
            formData.append('filename', filename);
            
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await fetch('http://localhost:7000/addProduct', {
                method: 'POST',
                body: formData
            })
        
            const data = await res.json();
            return data;
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
            let description = e.target.description.value
            let imageFile = e.target.image.files[0]
            let filename = e.target.imgFilename.value

            let res = postData(pId, pname, description, price, imageFile, filename)

            if(res){
                console.log("Added!")
                e.target.id.value = ""
                e.target.name.value = ""
                e.target.price.value = ""
                e.target.description.value = ""
                e.target.image.value = ""
                e.target.imgFilename.value = ""
            }
        })

        document.getElementById('logout').addEventListener('click', ()=>{
            logout()
        })