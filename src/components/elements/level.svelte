<!-- 
  Use this as bulma's level layout component.
  https://bulma.io/documentation/layout/level/

  Difference:
  1. won't center the content on mobile. Instead it is always ready to go multiline 
  2. add .column and .is-narrow for every item
 -->
<div class="columns is-multiline is-mobile">
  <slot name="left" />
  <div class="column" />
  <slot name="right" />
</div>
