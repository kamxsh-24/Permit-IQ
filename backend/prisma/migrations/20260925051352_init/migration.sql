-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('REQUESTER', 'AREA_OWNER', 'SAFETY_OFFICER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PermitStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'REJECTED', 'CLOSED', 'CLOSED_VERIFIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PermitType" AS ENUM ('HOT_WORK', 'CONFINED_SPACE', 'WORKING_AT_HEIGHT', 'ELECTRICAL_LOTO', 'EXCAVATION');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "areaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "equipmentTag" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permit" (
    "id" TEXT NOT NULL,
    "permitNumber" TEXT NOT NULL,
    "type" "PermitType" NOT NULL,
    "status" "PermitStatus" NOT NULL DEFAULT 'DRAFT',
    "requesterId" TEXT NOT NULL,
    "contractorTeam" TEXT NOT NULL,
    "workDescription" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "equipmentId" TEXT,
    "plannedStart" TIMESTAMP(3) NOT NULL,
    "plannedEnd" TIMESTAMP(3) NOT NULL,
    "hazards" JSONB NOT NULL,
    "ppeRequired" JSONB NOT NULL,
    "precautions" JSONB NOT NULL,
    "typeSpecificData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermitApproval" (
    "id" TEXT NOT NULL,
    "permitId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermitApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermitAuditLog" (
    "id" TEXT NOT NULL,
    "permitId" TEXT NOT NULL,
    "whoId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromValue" TEXT,
    "toValue" TEXT,
    "comment" TEXT,

    CONSTRAINT "PermitAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_areaId_idx" ON "User"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "Plant_code_key" ON "Plant"("code");

-- CreateIndex
CREATE INDEX "Area_plantId_idx" ON "Area"("plantId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_equipmentTag_key" ON "Equipment"("equipmentTag");

-- CreateIndex
CREATE INDEX "Equipment_areaId_idx" ON "Equipment"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "Permit_permitNumber_key" ON "Permit"("permitNumber");

-- CreateIndex
CREATE INDEX "Permit_status_idx" ON "Permit"("status");

-- CreateIndex
CREATE INDEX "Permit_type_idx" ON "Permit"("type");

-- CreateIndex
CREATE INDEX "Permit_areaId_idx" ON "Permit"("areaId");

-- CreateIndex
CREATE INDEX "Permit_plantId_idx" ON "Permit"("plantId");

-- CreateIndex
CREATE INDEX "Permit_plannedStart_idx" ON "Permit"("plannedStart");

-- CreateIndex
CREATE INDEX "Permit_plannedEnd_idx" ON "Permit"("plannedEnd");

-- CreateIndex
CREATE INDEX "Permit_requesterId_idx" ON "Permit"("requesterId");

-- CreateIndex
CREATE INDEX "Permit_status_type_idx" ON "Permit"("status", "type");

-- CreateIndex
CREATE INDEX "PermitApproval_permitId_idx" ON "PermitApproval"("permitId");

-- CreateIndex
CREATE INDEX "PermitApproval_approverId_idx" ON "PermitApproval"("approverId");

-- CreateIndex
CREATE INDEX "PermitAuditLog_permitId_idx" ON "PermitAuditLog"("permitId");

-- CreateIndex
CREATE INDEX "PermitAuditLog_whoId_idx" ON "PermitAuditLog"("whoId");

-- CreateIndex
CREATE INDEX "PermitAuditLog_timestamp_idx" ON "PermitAuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permit" ADD CONSTRAINT "Permit_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permit" ADD CONSTRAINT "Permit_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permit" ADD CONSTRAINT "Permit_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permit" ADD CONSTRAINT "Permit_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermitApproval" ADD CONSTRAINT "PermitApproval_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "Permit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermitApproval" ADD CONSTRAINT "PermitApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermitAuditLog" ADD CONSTRAINT "PermitAuditLog_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "Permit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermitAuditLog" ADD CONSTRAINT "PermitAuditLog_whoId_fkey" FOREIGN KEY ("whoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
