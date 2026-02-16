from rest_framework.response import Response

def api_response(data=None, message="Operation successful.", status_code=200):
    payload = data if data is not None else {}
    if isinstance(payload, dict):
        payload['message'] = message
        
    return Response(payload, status=status_code)
