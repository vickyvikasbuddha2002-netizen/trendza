export default async function handler(req, res) {
    if (req.method !== 'PUT') return res.status(405).send('Method Not Allowed');
    if (req.headers['x-admin-pass'] !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

    const { table, id, data } = req.body;

    try {
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Error updating');
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
