from rest_framework import permissions

class IsHallAdmin(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'venue-manager'
    
class IsSystemAdmin(permissions.BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'sys-admin'
        )