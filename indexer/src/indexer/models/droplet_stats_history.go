package models

import (
	"time"
)

type DropletStatsHistory struct {
	ID             uint64    `gorm:"primary_key"`
	TotalDroplets  uint64    `gorm:"column:total_droplets"`
	TotalAddresses uint64    `gorm:"column:total_addresses"`
	Height         uint64    `gorm:"column:height"`
	DateBlock      time.Time `gorm:"column:date_block"`
	DateCreated    time.Time `gorm:"column:date_created"`
}

func (DropletStatsHistory) TableName() string {
	return "droplet_stats_history"
}
