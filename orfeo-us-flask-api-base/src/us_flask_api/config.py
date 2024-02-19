# -*- coding: utf-8 -*-
""" KARONT3 Threat Intelligence API """
 
# pylint: disable=W0102,E0712,C0103
# fmt: on
from environs import Env
 
env = Env()
env.read_env()
 
 
class Config(object):
    """Base config, uses staging settings"""
 
    TESTING = False
    DB_SERVER = "localhost"
    SECRET_KEY = "88a4e52d73b514e26d72d4ac4c99efacf1147861c0de6d629d2b597c5a46a10c2ecf880afa381bca88659221df83a6e865837ad87c7f31be22cc68680314fd22"
    SESSION_COOKIE_NAME = "ewala"
    APIFAIRY_TITLE = "KARONT3 Threat Intelligence API"
    APIFAIRY_VERSION = "0.1.0"
    APIFAIRY_UI = "redoc"
    APIFAIRY_UI_PATH = "/docs"
 
    """ AWS Config -- Karont3-dev-2"""
    # COGNITO_POOL_ID = 'eu-west-1_IGvdFe8gJ'
    # COGNITO_CLIENT_ID = '6cb42g781sb3hnvli4olno01mi'
    # COGNITO_CLIENT_SECRET = 'h6puuqus4r252c53rullm5fm2o3um0ocv4eer6hl655ctn7deut'
    # COGNITO_DOMAIN = 'karont3-dev2-local.auth.eu-west-1.amazoncognito.com'
    # COGNITO_DOMAIN = 'https://karont3-dev2-local.auth.eu-west-1.amazoncognito.com'
 
    ACCESS_KEY = env("ACCESS_KEY")
    SECRET_ACCESS_KEY = env("SECRET_ACCESS_KEY")
    """ Database config"""
    DB_HOST = "localhost"
    DB_USER = "orfeouser"
    DB_PASS = "orfeopassword"
    DB_PORT = 5432
    DB_NAME = "orfeo_postgres_db"
    """ Logging Level"""
    LOGGING_LEVEL = "INFO"
 
    @property
    def DATABASE_URI(self):  # Note: all caps
        return f"jdbc:postgresql://localhost:5432/orfeo_postgres_db"
 
 
class ProductionConfig(Config):
    """Uses Production configuration settings"""
 
    DB_SERVER = "10.10.10.200"
 
 
class DevelopmentConfig(Config):
    """Uses Development configuration settings"""
 
    """ Database config """
    """ Database config"""
    DB_HOST = "localhost"
    DB_USER = "orfeouser"
    DB_PASS = "orfeopassword"
    DB_PORT = 5432
    DB_NAME = "orfeo_postgres_db"
 
    """ URL """
    APP_URL = "localhost:5000"
    FRONT_URL = "http://localhost:5173"
 
    """ Logging Level"""
    LOGGING_LEVEL = "INFO"
 
    """ AWS Config -- kront3-dev-local """
    AWS_REGION = env("AWS_REGION")
    COGNITO_POOL_ID = env("COGNITO_POOL_ID")
    COGNITO_CLIENT_ID = env("COGNITO_CLIENT_ID")
    COGNITO_CLIENT_SECRET = env("COGNITO_CLIENT_SECRET")
    COGNITO_DOMAIN = env("COGNITO_DOMAIN")
    COGNITO_AUTH_FLOW =env("COGNITO_AUTH_FLOW")
    SECRET_KEY = env("SECRET_KEY")
    
class TestingConfig(Config):
    """Uses Testing configuration settings"""
 
    TESTING = True
    DB_SERVER = "localhost"