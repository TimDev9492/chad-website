<script>
  import { goto } from '$app/navigation';

  let { data, children } = $props();
  let { supabase } = $derived(data);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    } else {
      goto('/');
    }
  };
</script>

<header>
  <button onclick={logout}>Logout</button>
</header>
<main>
  {@render children()}
</main>
