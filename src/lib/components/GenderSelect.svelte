<script lang="ts">
  import FormField from '@smui/form-field';
  import Radio from '@smui/radio';
  import type { Database } from '../../types/database.types';

  type Gender = Database['public']['Tables']['genders']['Row']['name'];

  let {
    genders,
    selected = $bindable(),
  }: { genders: Gender[]; selected: Gender | null } = $props();
</script>

<div class="margins">
  {#each genders as gender}
    <FormField style="margin-right: 1em;">
      <Radio
        bind:group={selected}
        value={gender} />
      {#snippet label()}
        {`${gender[0].toUpperCase()}${gender.slice(1)}`}
      {/snippet}
    </FormField>
  {/each}
</div>
