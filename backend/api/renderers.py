from rest_framework.renderers import JSONRenderer

class UniversalRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response')
        
        status_bool = True if response.status_code < 400 else False
        
        message = ""
        if status_bool:
            message = data.get('message', "عملیات با موفقیت انجام شد") if isinstance(data, dict) else "عملیات با موفقیت انجام شد"
        else:
            message = "خطایی رخ داده است"
            if isinstance(data, dict):
                message = data.get('detail', data.get('message', message))

        standardized_response = {
            "status": status_bool,
            "message": message,
            "data": data
        }

        if isinstance(data, dict) and 'results' in data and 'page' in data:
            standardized_response['data'] = data['results']
            standardized_response['page'] = data['page']
            standardized_response['total_items'] = data['total_items']
            if 'page_size' in data:
                standardized_response['page_size'] = data['page_size']

        return super().render(standardized_response, accepted_media_type, renderer_context)