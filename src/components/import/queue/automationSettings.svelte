<script>
  import type { AutomationSettings } from '$core/import/types';
  import type { FormStore } from '$strict/base';

  import { Form, Field, FieldContext, RangeInput, CheckboxInput } from '$strict';
  import SettingsDropdown from '$components/elements/dropdown/settings.svelte';

  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';

  import { ensureBoolean, ensureNumber, moreThan, lessThan } from '$validators';
  import { setUserSetting, automationSettingsStore } from '$stores/decr/user';

  $: checkboxField = {
    name: 'disableAutomation',
    label: $_('cmps.import.scheme.automation.disableLabel'),
    clean: [ensureBoolean],
    inputValue: $automationSettingsStore.disableAutomation,
  };

  const min = 0,
    max = 1,
    step = 0.2;
  $: powerField = {
    name: 'automationPower',
    label: $_('cmps.import.scheme.automation.power.label'),
    help: $_('cmps.import.scheme.automation.power.help'),
    type: 'range',
    clean: [ensureNumber],
    validators: [moreThan(min), lessThan(max)],
    inputValue: $automationSettingsStore.automationPower,
  };

  let show: boolean;

  // Hiding power range input if automation is disabled at all
  let formStore: FormStore | undefined, showPower: boolean;
  $: if (formStore) showPower = !$formStore.fields.disableAutomation.inputValue;

  const success = async (data: AutomationSettings) => {
    await setUserSetting('automation', data);
    show = false;
  };
</script>

<SettingsDropdown bind:show>
  <h3 class="is-size-6 mb-4">{$_('cmps.import.scheme.automation.header')}</h3>
  <Form
    {success}
    notificationText={$_('cmps.import.scheme.automation.successNotif')}
    bind:formStore>
    <div class="pb-3 is-size-7">
      <FieldContext field={checkboxField}>
        <CheckboxInput />
      </FieldContext>
    </div>

    {#if showPower}
      <div transition:slide|local>
        <Field field={powerField}>
          <RangeInput {min} {max} {step} />
        </Field>
      </div>
    {/if}

    <div class="pt-3" slot="submit">
      <button class="button is-small is-fullwidth">{$_('common.form.update')}</button>
    </div>
  </Form>
</SettingsDropdown>
