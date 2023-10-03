#!/usr/bin/env python3

import connexion
from flask_cors import CORS
from swagger_server import encoder

app = connexion.App(__name__, specification_dir='./swagger/')


def main():
    app.app.json_encoder = encoder.JSONEncoder
    CORS(app.app)
    app.add_api('swagger.yaml', arguments={'title': 'Language Model API'}, pythonic_params=True)
    app.run(port=8080)


if __name__ == '__main__':
    main()
