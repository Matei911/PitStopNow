import string
import random


def generate_random_string(length):
    # Alegem caracterele permise: litere mari, mici și cifre
    characters = string.ascii_letters + string.digits
    # Generăm un string random de lungimea specificată
    random_string = ''.join(random.choices(characters, k=length))
    return random_string


