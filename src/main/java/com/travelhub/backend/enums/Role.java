package com.travelhub.backend.enums;

/**
 * Role enum defines the different types of users and their access levels in the TravelHub system.
 */
public enum Role {
    // Regular tourist who can browse and book travel packages
    TOURIST,
    
    // System administrator with full access to manage users, packages, and settings
    ADMIN,
    
    // Travel agent or agency representative who manages packages and vehicles
    AGENT,
    
    // Hotel owner or representative who manages hotel listings and rooms
    HOTEL_OWNER
}