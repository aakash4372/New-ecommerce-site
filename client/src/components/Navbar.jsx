import React, { useState } from "react";
import { Drawer, IconButton, List, ListItem, ListItemText, Badge, Menu, MenuItem } from "@mui/material";
import { Menu as MenuIcon, ShoppingCart, User, Mail, Phone, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [cartItemsCount] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);

  const toggleDrawer = (value) => () => setOpen(value);

  const handleUserClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <div className="flex justify-between items-center px-4 py-2 bg-white border-b">
        <div className="flex items-center gap-2">
          {/* Improved Menu Toggle Button */}
          <button
            onClick={toggleDrawer(true)}
            className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors md:hidden"
            aria-label="Open menu"
          >
            <MenuIcon color="black" />
          </button>
          <span className="text-2xl font-bold">NOVA</span>
        </div>

        <div className="flex items-center gap-4">
          <IconButton onClick={handleUserClick} aria-label="User menu">
            <User color="black" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: { minWidth: 120 },
            }}
          >
            <MenuItem
              onClick={handleUserClose}
              sx={{
                "&:hover": { backgroundColor: "black", color: "white" },
              }}
            >
              Sign Up
            </MenuItem>
            <MenuItem
              onClick={handleUserClose}
              sx={{
                "&:hover": { backgroundColor: "black", color: "white" },
              }}
            >
              Sign In
            </MenuItem>
          </Menu>
          <IconButton aria-label="Shopping cart">
            <Badge badgeContent={cartItemsCount} color="error" overlap="circular">
              <ShoppingCart color="black" />
            </Badge>
          </IconButton>
        </div>

        <Drawer
          anchor="left"
          open={open}
          onClose={toggleDrawer(false)}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          <div
            className="w-60 flex flex-col justify-between h-full p-4 relative"
            role="presentation"
          >
            {/* Improved Close Button */}
            <button
              onClick={toggleDrawer(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-200 active:bg-gray-300 rounded transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            <div className="mt-8">
              <List>
                {["Home", "About", "Product", "Contact"].map((text) => (
                  <ListItem 
                    button 
                    key={text}
                    sx={{
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                      "&.Mui-selected": { backgroundColor: "rgba(0, 0, 0, 0.08)" },
                      "&.Mui-focusVisible": { backgroundColor: "rgba(0, 0, 0, 0.12)" }
                    }}
                  >
                    <ListItemText primary={text} />
                  </ListItem>
                ))}
              </List>
            </div>

            {/* Contact Info Section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href="mailto:yourmailid@yourdomain.com"
                className="flex items-center gap-3 py-2 hover:underline text-sm text-gray-800 hover:bg-gray-100 active:bg-gray-200 rounded px-2 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>yourmailid@yourdomain.com</span>
              </a>

              <a
                href="tel:01234567890"
                className="flex items-center gap-3 py-2 hover:underline text-sm text-gray-800 hover:bg-gray-100 active:bg-gray-200 rounded px-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>01234567890</span>
              </a>
            </div>
          </div>
        </Drawer>
      </div>

      <div className="hidden md:flex bg-white text-black px-4 py-2 gap-6 font-medium text-sm border-b justify-start">
        <a href="#" className="hover:text-red-600">Home</a>
        <a href="#" className="hover:text-red-600">About</a>
        <a href="#" className="hover:text-red-600">Product</a>
        <a href="#" className="hover:text-red-600">Contact</a>
      </div>
    </>
  );
};

export default Navbar;