# 人物/追踪源管理路由

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import Person, Source, Discovery
from app.schemas import (
    PersonCreate, PersonUpdate, PersonResponse,
    SourceCreate, SourceResponse, PersonBrief,
)

router = APIRouter()


# ============ People ============

@router.get("/", response_model=list[PersonResponse])
async def list_people(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Person)
        .options(selectinload(Person.sources), selectinload(Person.discoveries))
        .order_by(Person.created_at.desc())
    )
    people = result.scalars().all()
    return [_person_to_response(p) for p in people]


@router.post("/", response_model=PersonResponse, status_code=201)
async def create_person(data: PersonCreate, db: AsyncSession = Depends(get_db)):
    exists = await db.execute(select(Person).where(Person.uid == data.uid))
    if exists.scalar_one_or_none():
        raise HTTPException(400, f"Person uid '{data.uid}' already exists")

    person = Person(**data.model_dump())
    db.add(person)
    await db.commit()
    await db.refresh(person)
    return PersonResponse(
        id=person.id, uid=person.uid, name=person.name,
        person_type=person.person_type, aliases=person.aliases or [],
        keywords=person.keywords or [],
        created_at=person.created_at, updated_at=person.updated_at,
        source_count=0, discovery_count=0,
    )


@router.get("/{uid}", response_model=PersonResponse)
async def get_person(uid: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Person)
        .options(selectinload(Person.sources), selectinload(Person.discoveries))
        .where(Person.uid == uid)
    )
    person = result.scalar_one_or_none()
    if not person:
        raise HTTPException(404, "Person not found")
    return _person_to_response(person)


@router.put("/{uid}", response_model=PersonResponse)
async def update_person(uid: str, data: PersonUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Person)
        .options(selectinload(Person.sources), selectinload(Person.discoveries))
        .where(Person.uid == uid)
    )
    person = result.scalar_one_or_none()
    if not person:
        raise HTTPException(404, "Person not found")

    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(person, key, val)

    await db.commit()
    await db.refresh(person)
    return _person_to_response(person)


def _person_to_response(p: Person) -> PersonResponse:
    return PersonResponse(
        id=p.id,
        uid=p.uid,
        name=p.name,
        person_type=p.person_type,
        aliases=p.aliases,
        keywords=p.keywords,
        created_at=p.created_at,
        updated_at=p.updated_at,
        source_count=len(p.sources),
        discovery_count=len(p.discoveries),
    )


@router.delete("/{uid}", status_code=204)
async def delete_person(uid: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Person).where(Person.uid == uid))
    person = result.scalar_one_or_none()
    if not person:
        raise HTTPException(404, "Person not found")
    await db.delete(person)
    await db.commit()


# ============ Sources ============

@router.get("/{uid}/sources", response_model=list[SourceResponse])
async def list_sources(uid: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Source).join(Person).where(Person.uid == uid)
    )
    return result.scalars().all()


@router.post("/{uid}/sources", response_model=SourceResponse, status_code=201)
async def create_source(uid: str, data: SourceCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Person).where(Person.uid == uid))
    person = result.scalar_one_or_none()
    if not person:
        raise HTTPException(404, "Person not found")

    source = Source(
        uid=data.uid,
        person_id=person.id,
        source_type=data.source_type,
        platform=data.platform,
        url=data.url,
        keyword=data.keyword,
        check_frequency=data.check_frequency,
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return source


@router.delete("/sources/{source_uid}", status_code=204)
async def delete_source(source_uid: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Source).where(Source.uid == source_uid))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(404, "Source not found")
    await db.delete(source)
    await db.commit()


# ============ Brief list for frontend ============

@router.get("/brief/all", response_model=list[PersonBrief])
async def list_people_brief(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Person)
        .options(selectinload(Person.sources), selectinload(Person.discoveries))
        .order_by(Person.name)
    )
    people = result.scalars().all()
    return [
        PersonBrief(
            uid=p.uid,
            name=p.name,
            source_count=len(p.sources),
            new_count=sum(1 for d in p.discoveries if d.status == "NEW"),
        )
        for p in people
    ]
