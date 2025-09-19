<template>
    <div id="app">
      <NavBar />
      <main class="container">
        <router-view />
      </main>
    </div>
  </template>
  
  <script setup>
  import NavBar from './components/NavBar.vue';

  </script>
  
  <style>
  /* very minimal */
  #app { font-family: Arial, Helvetica, sans-serif; }
  .container { padding: 20px; max-width: 960px; margin: 0 auto; }

 


  </style>
  