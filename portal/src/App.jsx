import React, { useState, useEffect } from 'react';
import Navbar from './components/shared/Navbar';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/auth/Login';
import Home from './components/Home';
import GoogleMap from './components/GoogleMap';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element:<Home/>
  },
  {
    path: '/login',
    element:<Login/>
  },

  {
    path: '/map',
    element:<GoogleMap/>
  },
  {
    path: '/home',
    element:<Home/>
  },
])

const App = () => {

  return (
    <div>
      <RouterProvider router = {appRouter}/>
    
    </div>
  );
};

export default App;