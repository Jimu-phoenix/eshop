 const addViews = async () => {
    try {
                const response = await fetch('http://localhost:7000/addView', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({view: 1})
                });
                
                const result = await response.json();
                console.log("Rees", response)
                console.log("result", result)

                if (response.ok) {
                    console.log('Viewed!')
                } else {
                    console.log('Not Viewed!')
                }
            } catch (error) {
                console.error('View error:', error);
            } 
 }

 addViews();