import connexion
import six

from swagger_server.models.inline_response200 import InlineResponse200  # noqa: E501
from swagger_server.models.v1_generate_body import V1GenerateBody  # noqa: E501
from swagger_server import util


def v1_generate_post(body):  # noqa: E501
    """Generate text using a language model

     # noqa: E501

    :param body: JSON request body
    :type body: dict | bytes

    :rtype: InlineResponse200
    """
    if connexion.request.is_json:
        body = V1GenerateBody.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'
