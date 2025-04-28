<script lang="ts">
  import Ripple from '@smui/ripple';

  let { data } = $props();
  let { user, infosProvided, hasPaid, userAppData } = $derived(data);

  let isSignedIn = $derived(user !== null);
  let hasSentMoney = $derived(
    ['PENDING_APPROVAL', 'CONFIRMED'].includes(userAppData.payment_status),
  );

  let hoveringIcon = $state<string | null>(null);
</script>

<div
  class="portrait:w-full grid grid-cols-1 portrait:opacity-50 portrait:hover:opacity-100 transition-opacity"
>
  <div
    class="flex flex-col items-center portrait:flex-row portrait:justify-center"
  >
    {@render checkpoint(
      'account_circle',
      'Account erstellen',
      isSignedIn,
      '/login',
    )}
    <div class={'path' + (isSignedIn ? ' done' : '')}></div>
    {@render checkpoint(
      'assignment',
      'Anmeldeformular ausfüllen',
      infosProvided,
      '/user/info',
    )}
    <div class={'path' + (infosProvided ? ' done' : '')}></div>
    {@render checkpoint(
      'paid',
      'Tagungsbeitrag überweisen',
      hasSentMoney,
      '/user/payments',
    )}
    <div class={'path' + (hasSentMoney ? ' done' : '')}></div>
    {@render checkpoint(
      'schedule',
      'Auf Zahlungsbestätigung warten',
      hasPaid,
      '/user/payments',
    )}
  </div>
</div>

{#snippet checkpoint(
  icon: string,
  description: string,
  completed: boolean,
  href: string,
)}
  <div class="relative">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <a
      {href}
      use:Ripple={{ surface: true }}
      class={'checkpoint material-icons cursor-pointer !text-black' +
        (completed ? ' done' : '')}
      onmouseenter={() => (hoveringIcon = icon)}
      onmouseleave={() => (hoveringIcon = null)}
    >
      {completed ? 'check' : icon}
    </a>
    <div
      class={'tooltip transition-opacity chad-text-sm ' +
        (hoveringIcon === icon ? 'opacity-100' : 'opacity-0')}
    >
      {description}
    </div>
  </div>
{/snippet}

<style>
  .checkpoint {
    border-radius: 50%;
    width: 3rem;
    aspect-ratio: 1/1;
    display: flex;
    justify-content: center;
    align-items: center;

    background-color: #d1d5db;
  }

  .done {
    background-color: #86efac !important;
  }

  .path {
    @media (orientation: landscape) {
      width: 0.5rem;
      height: 4rem;
      margin: -0.25rem 0 -0.25rem 0;
    }
    @media (orientation: portrait) {
      max-width: 4rem;
      width: 100%;
      height: 0.5rem;
      margin: 0 -0.25rem 0 -0.25rem;
    }

    background-color: #d1d5db;
  }

  .tooltip {
    cursor: default;
    position: absolute;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem 0.25rem 0.5rem;
    @media (orientation: landscape) {
      top: 50%;
      transform: translateY(-50%);
      right: 100%;
      margin-right: 0.5rem;
    }
    @media (orientation: portrait) {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 0.5rem;
    }
  }
</style>
