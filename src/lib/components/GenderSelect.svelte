<script lang="ts">
  import FormField from '@smui/form-field';
  import Radio from '@smui/radio';
  import type { Database } from '../../types/database.types';

  type Gender = Database['public']['Tables']['genders']['Row']['name'];

  let {
    genders,
    disabled,
    selected = $bindable(),
  }: {
    genders: Gender[];
    disabled: boolean;
    selected: Gender | null;
  } = $props();
</script>

<div class="margins">
  {#each genders as gender}
    <FormField style="margin-right: 1em;">
      <Radio
        bind:group={selected}
        {disabled}
        value={gender}
      />
      {#snippet label()}
        <span class={disabled ? 'opacity-50 select-none' : ''}>
          {`${gender[0].toUpperCase()}${gender.slice(1)}`}
        </span>
      {/snippet}
    </FormField>
  {/each}
</div>
