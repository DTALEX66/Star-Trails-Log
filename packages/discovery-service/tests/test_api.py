"""Phase 2 后端全链路测试"""
import httpx, asyncio, sys

BASE = "http://localhost:8766"
ok = total = 0

async def check(label, cond):
    global ok, total
    total += 1
    if cond:
        ok += 1; print(f"  ✅ {label}")
    else:
        print(f"  ❌ {label}")

async def test():
    global ok, total
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{BASE}/api/health")
        await check("Health", r.status_code == 200 and r.json()["status"] == "ok")

        r = await c.post(f"{BASE}/api/people/", json={"uid":"p1","name":"王一珩","person_type":"star"})
        await check("Create person", r.status_code == 201)

        r = await c.get(f"{BASE}/api/people/")
        await check("List people", r.status_code == 200 and len(r.json()) == 1)

        r = await c.get(f"{BASE}/api/people/p1")
        await check("Get person", r.status_code == 200 and r.json()["name"] == "王一珩")

        r = await c.post(f"{BASE}/api/people/p1/sources", json={
            "uid":"src_001","person_uid":"p1","source_type":"keyword","platform":"bilibili","keyword":"新歌"
        })
        await check("Create source", r.status_code == 201)

        r = await c.get(f"{BASE}/api/people/p1/sources")
        await check("List sources", r.status_code == 200)

        r = await c.get(f"{BASE}/api/discovery/")
        await check("Discovery list", r.status_code == 200)

        r = await c.get(f"{BASE}/api/discovery/new")
        await check("New discoveries", r.status_code == 200)

        r = await c.get(f"{BASE}/api/discovery/stats")
        await check("Discovery stats", r.status_code == 200)

        r = await c.post(f"{BASE}/api/discovery/trigger")
        await check("Trigger discovery", r.status_code == 200)

        r = await c.get(f"{BASE}/api/stats")
        s = r.json()
        await check("Stats person=1", s["total_people"] == 1)

        r = await c.get(f"{BASE}/api/people/brief/all")
        await check("Brief list", r.status_code == 200 and len(r.json()) == 1)

    print(f"\n📊 {ok}/{total} passed")
    return ok == total

if __name__ == "__main__":
    success = asyncio.run(test())
    sys.exit(0 if success else 1)
