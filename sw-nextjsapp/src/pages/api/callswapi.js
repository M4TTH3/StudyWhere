export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            res.status(405).json({message: 'Only POST requests allowed'});
            return;
        }

        // const backEndEnpoint = 'https://api.studywhere.ca/api/'; // Prod
        const backEndEnpoint = 'http://localhost:5000/api/'

        const body = req.body;
        const endpoint = backEndEnpoint + body.endpoint;
        const params = body.params;

        const data = await fetch(endpoint, params);
        
        if (data.status !== 200) {
            res.status(data.status).json({message: data.statusText});
            return;
        }
        
        const response = await data.json();

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({message: 'Error: ' + error})
    }
}