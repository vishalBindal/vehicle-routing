FROM python:3.7-slim
RUN pip3 install falcon gunicorn ortools
RUN pip3 install falcon_cors
COPY json_answer.py distance_matrix.py solver.py key.py vrp_api.py /code/
WORKDIR /code
# CMD gunicorn vrp_api -b :16000 --reload
RUN adduser --disabled-login myuser
# RUN adduser -m myuser
USER myuser

CMD gunicorn vrp_api --bind 0.0.0.0:$PORT --reload
