
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://piudpsetgfmdxpnavheu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ypbZYnnAq0_Q9f9AY8czWw__pZ2fxG4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    console.log('Searching for user "boss"...');

    // 1. Find user by username
    const { data: users, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', 'Boss');

    if (findError) {
        console.error('Error finding user:', findError);
        return;
    }

    if (!users || users.length === 0) {
        console.error('User "boss" not found!');
        // Try fuzzy search just in case
        const { data: similar } = await supabase.from('profiles').select('username').ilike('username', '%boss%');
        if (similar && similar.length > 0) {
            console.log('Did you mean one of these?', similar.map(u => u.username));
        }
        return;
    }

    const user = users[0];
    console.log(`Found user: ${user.username} (ID: ${user.id}, Current Role: ${user.role || 'none'})`);

    // 2. Update role
    console.log('Updating role to "admin"...');
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating role:', updateError);
    } else {
        console.log('SUCCESS: User "boss" is now an admin! 👑');
    }
}

main();
