# PAC Python Test Client + pytest(s)

Python Client for **PAC**

## Create Python VENV

```powershell
 python3 -m venv .venv
```

## Activate Python Environment

```powershell
.venv\Scripts\activate
```

## Restore libraries

```powershell
pip install -r requirements.txt
```

## Run pytest with coverage

```powershell
pytest --cov=.\pac_client --cov-report=html
```

Then open [Coverage Report](./htmlcov/index.html)

## Refs

- https://www.pythonguis.com/tutorials/getting-started-vs-code-python/ (My Favorite Article)
- https://pypi.org/project/psycopg2/
- https://learn.microsoft.com/en-us/windows/python/beginners#hello-world-tutorial-for-using-python-with-vs-code
