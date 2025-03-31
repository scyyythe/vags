from rest_framework import permissions

class IsAdminOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # admin can update any user (user status)
        if request.user.role == "Admin":
            return True
        
        # owner updates their own data , cannot upate if their not admin
        return str(obj.id) == str(request.user.id)
