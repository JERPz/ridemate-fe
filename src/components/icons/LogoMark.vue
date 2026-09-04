<script setup>
/**
 * RIDEMATE logo mark — a two-wheeler drawn from simple geometry.
 * Single colour via `currentColor`, so it works orange on light panels and
 * white as a watermark.
 */
</script>

<template>
  <svg
    viewBox="0 0 48 32"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <!-- wheels -->
    <circle cx="10" cy="22" r="7" />
    <circle cx="38" cy="22" r="7" />
    <!-- deck, steering column, handlebar and fork -->
    <path d="M10 22h16" />
    <path d="M26 22 31 9" />
    <path d="M27 8h9" />
    <path d="M31 9 38 22" />
    <!-- seat -->
    <path d="M11 15h9" />
  </svg>
</template>
