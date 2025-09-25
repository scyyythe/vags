from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.models.payment_model.payment_accounts import PaymentAccount

class ListPaymentAccounts(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        accounts = PaymentAccount.objects(user=request.user)
        data = []
        for acc in accounts:
            data.append({
                "id": str(acc.id),
                "type": acc.type,
                "name": acc.name,
                "account_info": acc.account_info,
                "is_default": acc.is_default,
                "details": acc.details,
                "created_at": acc.created_at.isoformat() if hasattr(acc, "created_at") else None,
            })
        return Response(data)

class AddOrUpdatePaymentAccount(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.data
        acc_id = payload.get("id")
        
        if acc_id:  # update
            account = PaymentAccount.objects(user=request.user, id=acc_id).first()
            if not account:
                return Response({"error": "Account not found"}, status=404)
        else:  # create new
            account = PaymentAccount(user=request.user)

        account.type = payload["type"]
        account.name = payload["name"]
        account.account_info = payload["account_info"]
        account.details = payload.get("details", {})
        account.is_default = payload.get("is_default", False)
        
        if account.is_default:
            # unset other default accounts
            PaymentAccount.objects(user=request.user, id__ne=account.id).update(set__is_default=False)
        
        account.save()
        return Response({"message": "Saved successfully", "id": str(account.id)}, status=201)

class DeletePaymentAccount(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, account_id):
        account = PaymentAccount.objects(user=request.user, id=account_id).first()
        if not account:
            return Response({"error": "Account not found"}, status=404)
        account.delete()
        return Response({"message": "Deleted successfully"})
