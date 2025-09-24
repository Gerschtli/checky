<script lang="ts">
	import { getUser } from '$lib/auth.remote';

	const user = await getUser();
</script>

<h1>Hi, {user.username}!</h1>
<p>Your user ID is {user.id}.</p>
