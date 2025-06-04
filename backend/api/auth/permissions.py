from rest_framework import permissions

class IsAdminOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
      
        if request.user.role == "Admin":
            return True
        
        
        return str(obj.id) == str(request.user.id)
