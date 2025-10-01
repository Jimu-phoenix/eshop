 const addViews = async () => {
    try {
                const response = await fetch('http://localhost:7000/addView/home', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({view: 1})
                });
                
                const result = await response.json();
                console.log("Res", response)
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
const ctx = document.getElementById('myChart');

  let distance = [10, 20, 30, 40 ,50]
  let time = [25, 35, 45, 50, 55]
  console.log("Time:", time)
  let theChart;
  let mychart = {
    type: 'pie',
    data: {
      labels: distance,
      datasets: [{
        label: 'Time',
        data: time,
         backgroundColor: [
          'rgba(255, 99, 132, 0.2)', 
          'rgba(54, 162, 235, 0.2)', 
          'rgba(255, 206, 86, 0.2)', 
          'rgba(75, 192, 192, 0.2)', 
          'rgba(153, 102, 255, 0.2)', 
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)', 
          'rgba(54, 162, 235, 1)', 
          'rgba(255, 206, 86, 1)', 
          'rgba(75, 192, 192, 1)', 
          'rgba(153, 102, 255, 1)', 
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

 addViews();