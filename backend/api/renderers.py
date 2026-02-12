from rest_framework.renderers import JSONRenderer

class UniversalRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response')
        
        status_bool = True if response.status_code < 400 else False
        
        message = ""
        if status_bool:
            message = "عملیات با موفقیت انجام شد"
        else:
            message = "خطایی رخ داده است"
            if isinstance(data, dict):
                message = data.get('detail', data.get('message', message))

        standardized_response = {
            "status": status_bool,
            "message": message,
            "data": data
        }

        return super().render(standardized_response, accepted_media_type, renderer_context)