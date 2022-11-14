import json
import os
import random as random
import numpy as np
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask
from flask_socketio import SocketIO
from gevent.pywsgi import WSGIServer
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')
socketio = SocketIO(app)

S1 = [100000]
S2 = [100000]
S3 = [100000]
S4 = [100000]
S5 = [100000]
S6 = [100000]
S7 = [100000]
S8 = [100000]

tick = 0
mu = 0
sigma_10 = 0.1
sigma_25 = 0.25
dt = 2/31536000

@app.route('/', methods = ['GET'])
def random_walk():
    # Boom 100 model
    A1 = random.choices((0,1), weights=(99, 1), k=1)
    unif_boom100_1 = np.random.uniform(0, 1, 1)
    unif_boom100_2 = np.random.uniform(75, 125, 1)
    price_move_boom_100 = np.round(-1.5 + unif_boom100_2*A1[0] + unif_boom100_1, 6)
    curr_boom_100_price = S1[-1] + price_move_boom_100
    S1.append(curr_boom_100_price)

    # Crash 100 model
    A2 = random.choices((0,1), weights=(99, 1), k=1)
    unif_crash100_1 = np.random.uniform(0, 1, 1)
    unif_crash100_2 = np.random.uniform(75, 125, 1)
    price_move_crash_100 = np.round(1.5 - unif_crash100_2*A2[0] - unif_crash100_1, 6)
    curr_crash_100_price = S2[-1] + price_move_crash_100
    S2.append(curr_crash_100_price)

    # Boom 300 model
    A3 = random.choices((0,1), weights=(299, 1), k=1)
    unif_boom300_1 = np.random.uniform(0, 1, 1)
    unif_boom300_2 = np.random.uniform(225, 375, 1)
    price_move_boom_300 = np.round(-1.5 + unif_boom300_2*A3[0] + unif_boom300_1, 6)
    curr_boom_300_price = S3[-1] + price_move_boom_300
    S3.append(curr_boom_300_price)

    # Crash 300 model
    A4 = random.choices((0,1), weights=(299, 1), k=1)
    unif_crash300_1 = np.random.uniform(0, 1, 1)
    unif_crash300_2 = np.random.uniform(225, 375, 1)
    price_move_crash_300 = np.round(1.5 - unif_crash300_2*A4[0] - unif_crash300_1, 6)
    curr_crash_300_price = S4[-1] + price_move_crash_300
    S4.append(curr_crash_300_price)

    # Boom 500 model
    A5 = random.choices((0,1), weights=(499, 1), k=1)
    unif_boom500_1 = np.random.uniform(0, 1, 1)
    unif_boom500_2 = np.random.uniform(375, 625, 1)
    price_move_boom_500 = np.round(-1.5 + unif_boom500_2*A5[0] + unif_boom500_1, 6)
    curr_boom_500_price = S5[-1] + price_move_boom_500
    S5.append(curr_boom_500_price)

    # Crash 500 model
    A6 = random.choices((0,1), weights=(499, 1), k=1)
    unif_crash500_1 = np.random.uniform(0, 1, 1)
    unif_crash500_2 = np.random.uniform(375, 625, 1)
    price_move_crash_500 = np.round(1.5 - unif_crash500_2*A6[0] - unif_crash500_1, 6)
    curr_crash_500_price = S6[-1] + price_move_crash_500
    S6.append(curr_crash_500_price)

    # Volatility 10
    dW = np.sqrt(dt)*np.random.normal(0,1,1)
    curr_price_vol_10 = S7[-1] * np.exp((mu-0.5*sigma_10**2)*dt + sigma_10*dW)
    S7.append(curr_price_vol_10)

    # Volatility 25
    dW = np.sqrt(dt)*np.random.normal(0,1,1)
    curr_price_vol_25 = S8[-1] * np.exp((mu-0.5*sigma_25**2)*dt + sigma_25*dW)
    S8.append(curr_price_vol_25)

    # Current Tick
    global tick
    tick = tick + 1

    # Current Time
    now = datetime.now()
    time_utc = now.strftime("%H:%M:%S")

    pricing = json.dumps({
        'current_boom_100_price': curr_boom_100_price[-1], 
        'current_boom_300_price': curr_boom_300_price[-1],
        'current_boom_500_price': curr_boom_500_price[-1],
        'current_crash_100_price': curr_crash_100_price[-1],
        'current_crash_300_price': curr_crash_300_price[-1], 
        'current_crash_500_price': curr_crash_500_price[-1], 
        'current_vol_10_price': curr_price_vol_10[-1], 
        'current_vol_25_price': curr_price_vol_25[-1],
        'tick': tick, 
        'time_utc': time_utc})

    socketio.emit('pricing', pricing)

@socketio.on('connect')
def test_connect():
    print('Client connected')

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

scheduler = BackgroundScheduler()
job = scheduler.add_job(random_walk, 'interval', seconds=1)
scheduler.start()

if __name__ == '__main__':
    socketio.run(WSGIServer((os.getenv('FLASK_HOST'), int(os.getenv('FLASK_PORT'))), app).serve_forever())
